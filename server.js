const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const db = require('./database');
const supabase = require('./supabase-client');

const app = express();
const PORT = 3000;

// Check if Supabase is configured
const SUPABASE_ENABLED = supabase !== null;
if (SUPABASE_ENABLED) {
  console.log('✓ Supabase sync enabled');
} else {
  console.log('⚠ Supabase sync disabled (not configured)');
}

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from React app (production)
app.use(express.static(path.join(__dirname, 'client/dist')));

// Fallback to old public folder if React build doesn't exist
app.use(express.static('public'));

// API Routes

// Get all time entries
app.get('/api/entries', (req, res) => {
  const { date, project } = req.query;
  let query = 'SELECT * FROM time_entries';
  const params = [];

  if (date || project) {
    query += ' WHERE';
    if (date) {
      query += ' date = ?';
      params.push(date);
    }
    if (project) {
      if (date) query += ' AND';
      query += ' project_name = ?';
      params.push(project);
    }
  }

  query += ' ORDER BY date DESC, start_time DESC';

  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get a single time entry
app.get('/api/entries/:id', (req, res) => {
  db.get('SELECT * FROM time_entries WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Entry not found' });
      return;
    }
    res.json(row);
  });
});

// Create a new time entry
app.post('/api/entries', (req, res) => {
  const { project_name, task_description, start_time, end_time, date } = req.body;

  if (!project_name || !start_time || !date) {
    res.status(400).json({ error: 'project_name, start_time, and date are required' });
    return;
  }

  // Calculate duration if end_time is provided
  let duration_minutes = null;
  if (end_time) {
    const start = new Date(`${date}T${start_time}`);
    const end = new Date(`${date}T${end_time}`);
    duration_minutes = Math.round((end - start) / 60000);
  }

  const query = `
    INSERT INTO time_entries (project_name, task_description, start_time, end_time, duration_minutes, date)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.run(query, [project_name, task_description, start_time, end_time, duration_minutes, date], async function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    // Add project to projects table if it doesn't exist
    db.run('INSERT OR IGNORE INTO projects (name) VALUES (?)', [project_name]);

    // Sync to Supabase if enabled
    if (SUPABASE_ENABLED) {
      try {
        // Insert project
        await supabase.from('projects').upsert({ name: project_name }, { onConflict: 'name' });

        // Insert time entry
        await supabase.from('time_entries').insert({
          project_name,
          task_description,
          start_time,
          end_time,
          duration_minutes,
          date
        });
        console.log('✓ Synced new entry to Supabase');
      } catch (error) {
        console.error('Warning: Failed to sync to Supabase:', error);
      }
    }

    res.json({ id: this.lastID, message: 'Time entry created successfully' });
  });
});

// Update a time entry
app.put('/api/entries/:id', (req, res) => {
  const { project_name, task_description, start_time, end_time, date } = req.body;

  // Calculate duration if end_time is provided
  let duration_minutes = null;
  if (end_time && start_time && date) {
    const start = new Date(`${date}T${start_time}`);
    const end = new Date(`${date}T${end_time}`);
    duration_minutes = Math.round((end - start) / 60000);
  }

  const query = `
    UPDATE time_entries
    SET project_name = ?, task_description = ?, start_time = ?, end_time = ?, duration_minutes = ?, date = ?
    WHERE id = ?
  `;

  db.run(query, [project_name, task_description, start_time, end_time, duration_minutes, date, req.params.id], async function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Entry not found' });
      return;
    }

    // Sync to Supabase if enabled
    if (SUPABASE_ENABLED) {
      try {
        // Note: We can't easily sync updates without storing Supabase IDs
        // For now, we'll log a warning
        console.log('⚠ Entry updated in SQLite only (Supabase sync for updates not fully implemented)');
      } catch (error) {
        console.error('Warning: Failed to sync to Supabase:', error);
      }
    }

    res.json({ message: 'Time entry updated successfully' });
  });
});

// Delete a time entry
app.delete('/api/entries/:id', (req, res) => {
  db.run('DELETE FROM time_entries WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Entry not found' });
      return;
    }
    res.json({ message: 'Time entry deleted successfully' });
  });
});

// Get all projects
app.get('/api/projects', (req, res) => {
  db.all('SELECT * FROM projects ORDER BY name', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get timesheet summary (total hours by project)
app.get('/api/summary', (req, res) => {
  const { start_date, end_date } = req.query;
  let query = `
    SELECT
      project_name,
      COUNT(*) as entry_count,
      SUM(duration_minutes) as total_minutes,
      ROUND(SUM(duration_minutes) / 60.0, 2) as total_hours
    FROM time_entries
    WHERE duration_minutes IS NOT NULL
  `;

  const params = [];
  if (start_date && end_date) {
    query += ' AND date BETWEEN ? AND ?';
    params.push(start_date, end_date);
  }

  query += ' GROUP BY project_name ORDER BY total_minutes DESC';

  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Serve React app for all other routes (must be after API routes)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'), (err) => {
    if (err) {
      // If React build doesn't exist, fall back to public/index.html
      res.sendFile(path.join(__dirname, 'public/index.html'));
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Timesheet app running at http://localhost:${PORT}`);
});
