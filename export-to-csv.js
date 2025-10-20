const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'timesheet.db');
const db = new sqlite3.Database(dbPath);

const csvPath = path.join(__dirname, 'timesheet-export.csv');

console.log('Exporting timesheet data to CSV...\n');

db.all('SELECT * FROM time_entries ORDER BY date DESC, start_time DESC', (err, entries) => {
  if (err) {
    console.error('Error reading database:', err);
    db.close();
    return;
  }

  if (entries.length === 0) {
    console.log('No entries to export.');
    db.close();
    return;
  }

  // Create CSV header
  const headers = ['ID', 'Date', 'Project Name', 'Task Description', 'Start Time', 'End Time', 'Duration (minutes)', 'Duration (hours)', 'Created At'];
  let csv = headers.join(',') + '\n';

  // Add data rows
  entries.forEach(entry => {
    const durationHours = entry.duration_minutes ? (entry.duration_minutes / 60).toFixed(2) : '';
    const row = [
      entry.id,
      entry.date,
      `"${entry.project_name}"`,
      `"${entry.task_description || ''}"`,
      entry.start_time,
      entry.end_time || '',
      entry.duration_minutes || '',
      durationHours,
      entry.created_at
    ];
    csv += row.join(',') + '\n';
  });

  // Write to file
  fs.writeFileSync(csvPath, csv, 'utf8');

  console.log(`✓ Successfully exported ${entries.length} entries to: ${csvPath}`);
  console.log('\nYou can open this file in Excel, Google Sheets, or any spreadsheet application.\n');

  db.close();
});
