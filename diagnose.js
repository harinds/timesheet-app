console.log('=== TIMESHEET APP DIAGNOSTICS ===\n');

// Check 1: Can we load modules?
console.log('1. Checking dependencies...');
try {
  require('express');
  require('sqlite3');
  require('cors');
  require('body-parser');
  console.log('   ✓ All npm packages are installed\n');
} catch (err) {
  console.log('   ✗ ERROR: Missing npm packages!');
  console.log('   Please run: npm install\n');
  console.log('   Error details:', err.message, '\n');
  process.exit(1);
}

// Check 2: Does database exist?
const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, 'timesheet.db');

console.log('2. Checking database file...');
if (fs.existsSync(dbPath)) {
  const stats = fs.statSync(dbPath);
  console.log(`   ✓ Database exists: ${dbPath}`);
  console.log(`   Size: ${stats.size} bytes\n`);
} else {
  console.log('   ✗ Database file not found');
  console.log('   It will be created when you first run the server\n');
}

// Check 3: Query database contents
console.log('3. Checking database contents...');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(dbPath);

db.all('SELECT COUNT(*) as count FROM time_entries', (err, result) => {
  if (err) {
    console.log('   ✗ Error reading database:', err.message);
  } else {
    const count = result[0].count;
    console.log(`   Database has ${count} time entries`);

    if (count === 0) {
      console.log('   → Database is EMPTY - no entries to export');
      console.log('   → Start the server and add entries through the web interface\n');
    } else {
      console.log('   ✓ Database has data!\n');
    }
  }

  // Check 4: Test if server can start
  console.log('4. Testing server configuration...');
  try {
    const express = require('express');
    const app = express();
    console.log('   ✓ Express can be loaded');
    console.log('   Server should be able to start on port 3000\n');
  } catch (err) {
    console.log('   ✗ Error with Express:', err.message, '\n');
  }

  console.log('=== DIAGNOSTIC COMPLETE ===\n');
  console.log('Next steps:');
  console.log('1. Run: node server.js');
  console.log('2. Open: http://localhost:3000');
  console.log('3. Add some time entries');
  console.log('4. Then try: node export-to-csv.js\n');

  db.close();
});
