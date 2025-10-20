const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  console.log('Environment check:', {
    hasUrl: !!process.env.SUPABASE_URL,
    hasKey: !!process.env.SUPABASE_ANON_KEY,
    urlPrefix: process.env.SUPABASE_URL ? process.env.SUPABASE_URL.substring(0, 20) : 'undefined'
  });

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Supabase credentials not configured',
        debug: {
          hasUrl: !!process.env.SUPABASE_URL,
          hasKey: !!process.env.SUPABASE_ANON_KEY
        }
      })
    };
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // GET /api/entries - Get all time entries
    if (event.httpMethod === 'GET' && !event.path.includes('/entries/')) {
      const { date, project } = event.queryStringParameters || {};

      let query = supabase.from('time_entries').select('*');

      if (date) {
        query = query.eq('date', date);
      }
      if (project) {
        query = query.eq('project_name', project);
      }

      const { data, error } = await query.order('date', { ascending: false }).order('start_time', { ascending: false });

      if (error) throw error;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data)
      };
    }

    // GET /api/entries/:id - Get single entry
    if (event.httpMethod === 'GET' && event.path.includes('/entries/')) {
      const id = event.path.split('/').pop();

      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Entry not found' })
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data)
      };
    }

    // POST /api/entries - Create new entry
    if (event.httpMethod === 'POST') {
      const { project_name, task_description, start_time, end_time, date } = JSON.parse(event.body);

      if (!project_name || !start_time || !date) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'project_name, start_time, and date are required' })
        };
      }

      // Calculate duration if end_time is provided
      let duration_minutes = null;
      if (end_time) {
        const start = new Date(`${date}T${start_time}`);
        const end = new Date(`${date}T${end_time}`);
        duration_minutes = Math.round((end - start) / 60000);
      }

      // Insert project
      await supabase.from('projects').upsert({ name: project_name }, { onConflict: 'name' });

      // Insert time entry
      const { data, error } = await supabase.from('time_entries').insert({
        project_name,
        task_description,
        start_time,
        end_time,
        duration_minutes,
        date
      }).select();

      if (error) throw error;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ id: data[0].id, message: 'Time entry created successfully' })
      };
    }

    // PUT /api/entries/:id - Update entry
    if (event.httpMethod === 'PUT') {
      const id = event.path.split('/').pop();
      const { project_name, task_description, start_time, end_time, date } = JSON.parse(event.body);

      // Calculate duration
      let duration_minutes = null;
      if (end_time && start_time && date) {
        const start = new Date(`${date}T${start_time}`);
        const end = new Date(`${date}T${end_time}`);
        duration_minutes = Math.round((end - start) / 60000);
      }

      const { data, error } = await supabase
        .from('time_entries')
        .update({
          project_name,
          task_description,
          start_time,
          end_time,
          duration_minutes,
          date
        })
        .eq('id', id)
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Entry not found' })
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Time entry updated successfully' })
      };
    }

    // DELETE /api/entries/:id - Delete entry
    if (event.httpMethod === 'DELETE') {
      const id = event.path.split('/').pop();

      const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Time entry deleted successfully' })
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
