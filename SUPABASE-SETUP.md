# Supabase Sync Setup Guide

Your timesheet app now supports syncing data to Supabase!

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

This will install the new packages:
- `@supabase/supabase-js` - Supabase client library
- `dotenv` - Environment variable management

### 2. Configure Your Credentials

Edit the `.env` file and add your Supabase credentials:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

To find these values:
1. Go to your Supabase project dashboard
2. Click on Settings (gear icon) → API
3. Copy the **Project URL** and **anon/public key**

### 3. Sync Existing Data (Optional)

If you already have data in your SQLite database, sync it to Supabase:

```bash
node sync-to-supabase.js
```

This will push all your existing:
- Projects
- Time entries

### 4. Start the Server

```bash
node server.js
```

You should see:
```
✓ Supabase sync enabled
Timesheet app running at http://localhost:3000
```

## How It Works

### Automatic Sync
- When you **add** a new time entry, it's saved to BOTH SQLite and Supabase
- SQLite remains your primary database (fast, local)
- Supabase gets a copy (cloud backup, accessible from anywhere)

### Manual Sync
- Run `node sync-to-supabase.js` anytime to push all SQLite data to Supabase
- Useful if you want to refresh Supabase with your local data

### View Your Data

**In Supabase Dashboard:**
1. Go to Table Editor
2. Select `time_entries` or `projects` table
3. View all your synced data

**Locally:**
```bash
node view-database.js    # View SQLite data
```

## Querying Supabase Directly

You can also query Supabase from your browser or other apps:

```javascript
const { data, error } = await supabase
  .from('time_entries')
  .select('*')
  .order('date', { ascending: false });
```

## Important Notes

1. **Updates and Deletes**: Currently only CREATE operations sync to Supabase automatically. Updates and deletes only affect SQLite.

2. **Re-sync**: To keep Supabase in sync after updates/deletes, run:
   ```bash
   node sync-to-supabase.js
   ```

3. **No Supabase?**: The app works fine without Supabase configured. It will just use SQLite only.

## Troubleshooting

**Error: "Supabase is not configured"**
- Check your `.env` file has the correct credentials
- Make sure there are no extra spaces around the values

**Error: "duplicate key value violates unique constraint"**
- This happens if you run sync-to-supabase.js multiple times
- It's safe to ignore for projects (they're upserted)
- For time_entries, clear the Supabase table first if you want to re-sync

**Server doesn't start**
- Make sure you ran `npm install`
- Check that `.env` file is in the timesheet-app folder

## Next Steps

1. Add some time entries through the web interface
2. Check Supabase dashboard to see them sync in real-time
3. Try querying your data from Supabase's API or build a mobile app!
