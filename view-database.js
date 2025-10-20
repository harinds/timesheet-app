const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'timesheet.db');
const db = new sqlite3.Database(dbPath);

console.log('\n========================================');
console.log('TIMESHEET DATABASE VIEWER');
console.log('========================================\n');

// View all time entries
db.all('SELECT * FROM time_entries ORDER BY date DESC, start_time DESC', (err, entries) => {
  if (err) {
    console.error('Error reading time entries:', err);
    return;
  }

  console.log('TIME ENTRIES:');
  console.log('─'.repeat(120));

  if (entries.length === 0) {
    console.log('No time entries found.\n');
  } else {
    console.log(`Found ${entries.length} entries:\n`);

    entries.forEach((entry, index) => {
      const duration = entry.duration_minutes
        ? `${Math.floor(entry.duration_minutes / 60)}h ${entry.duration_minutes % 60}m`
        : 'In Progress';

      console.log(`${index + 1}. [${entry.date}] ${entry.project_name}`);
      console.log(`   Task: ${entry.task_description || 'N/A'}`);
      console.log(`   Time: ${entry.start_time} - ${entry.end_time || 'Ongoing'} (${duration})`);
      console.log(`   Entry ID: ${entry.id}`);
      console.log('');
    });
  }

  // View summary by project
  db.all(`
    SELECT
      project_name,
      COUNT(*) as entry_count,
      SUM(duration_minutes) as total_minutes,
      ROUND(SUM(duration_minutes) / 60.0, 2) as total_hours
    FROM time_entries
    WHERE duration_minutes IS NOT NULL
    GROUP BY project_name
    ORDER BY total_minutes DESC
  `, (err, summary) => {
    if (err) {
      console.error('Error reading summary:', err);
      db.close();
      return;
    }

    console.log('\n========================================');
    console.log('SUMMARY BY PROJECT:');
    console.log('─'.repeat(120));

    if (summary.length === 0) {
      console.log('No completed entries found.\n');
    } else {
      let totalHours = 0;
      let totalEntries = 0;

      summary.forEach(project => {
        console.log(`\n${project.project_name}:`);
        console.log(`  Entries: ${project.entry_count}`);
        console.log(`  Total Time: ${project.total_hours} hours (${project.total_minutes} minutes)`);
        totalHours += project.total_hours;
        totalEntries += project.entry_count;
      });

      console.log('\n' + '='.repeat(120));
      console.log(`GRAND TOTAL: ${totalEntries} entries, ${totalHours.toFixed(2)} hours`);
      console.log('='.repeat(120) + '\n');
    }

    // View all projects
    db.all('SELECT * FROM projects ORDER BY name', (err, projects) => {
      if (err) {
        console.error('Error reading projects:', err);
      } else {
        console.log('\nREGISTERED PROJECTS:');
        console.log('─'.repeat(120));
        projects.forEach((project, index) => {
          console.log(`${index + 1}. ${project.name} (Created: ${project.created_at})`);
        });
        console.log('\n');
      }

      db.close();
    });
  });
});
