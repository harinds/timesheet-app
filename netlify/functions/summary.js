const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    if (event.httpMethod === 'GET') {
      const { start_date, end_date } = event.queryStringParameters || {};

      let query = supabase
        .from('time_entries')
        .select('project_name, duration_minutes')
        .not('duration_minutes', 'is', null);

      if (start_date && end_date) {
        query = query.gte('date', start_date).lte('date', end_date);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Group by project and calculate totals
      const summary = data.reduce((acc, entry) => {
        const project = entry.project_name;
        if (!acc[project]) {
          acc[project] = {
            project_name: project,
            entry_count: 0,
            total_minutes: 0,
            total_hours: 0
          };
        }
        acc[project].entry_count++;
        acc[project].total_minutes += entry.duration_minutes || 0;
        acc[project].total_hours = Math.round((acc[project].total_minutes / 60) * 100) / 100;
        return acc;
      }, {});

      const result = Object.values(summary).sort((a, b) => b.total_minutes - a.total_minutes);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result)
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
