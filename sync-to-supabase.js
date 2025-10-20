const db = require('./database');
const supabase = require('./supabase-client');

if (!supabase) {
  console.error('ERROR: Supabase is not configured!');
  console.error('Please edit the .env file with your Supabase credentials.');
  process.exit(1);
}

console.log('=== SYNCING SQLITE DATA TO SUPABASE ===\n');

async function syncProjects() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM projects', async (err, projects) => {
      if (err) {
        reject(err);
        return;
      }

      console.log(`Found ${projects.length} projects to sync...`);

      if (projects.length === 0) {
        resolve(0);
        return;
      }

      const projectsToInsert = projects.map(p => ({
        name: p.name,
        created_at: p.created_at
      }));

      const { data, error } = await supabase
        .from('projects')
        .upsert(projectsToInsert, { onConflict: 'name' });

      if (error) {
        console.error('Error syncing projects:', error);
        reject(error);
      } else {
        console.log(`✓ Synced ${projects.length} projects\n`);
        resolve(projects.length);
      }
    });
  });
}

async function syncTimeEntries() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM time_entries', async (err, entries) => {
      if (err) {
        reject(err);
        return;
      }

      console.log(`Found ${entries.length} time entries to sync...`);

      if (entries.length === 0) {
        resolve(0);
        return;
      }

      const entriesToInsert = entries.map(e => ({
        project_name: e.project_name,
        task_description: e.task_description,
        start_time: e.start_time,
        end_time: e.end_time,
        duration_minutes: e.duration_minutes,
        date: e.date,
        created_at: e.created_at
      }));

      const { data, error } = await supabase
        .from('time_entries')
        .insert(entriesToInsert);

      if (error) {
        console.error('Error syncing time entries:', error);
        reject(error);
      } else {
        console.log(`✓ Synced ${entries.length} time entries\n`);
        resolve(entries.length);
      }
    });
  });
}

async function main() {
  try {
    // First sync projects
    await syncProjects();

    // Then sync time entries
    await syncTimeEntries();

    console.log('=== SYNC COMPLETE ===');
    console.log('All SQLite data has been pushed to Supabase!\n');

    db.close();
    process.exit(0);
  } catch (error) {
    console.error('\n=== SYNC FAILED ===');
    console.error(error);
    db.close();
    process.exit(1);
  }
}

main();
