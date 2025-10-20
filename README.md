# Timesheet App

A full-stack timesheet application built with Node.js, Express, and SQLite for tracking work hours and managing timesheets.

## Features

- Add, edit, and delete time entries
- Track project name, task description, start/end times, and dates
- Automatic duration calculation
- View timesheet summaries by date range
- Total hours by project reporting
- Responsive web interface
- SQLite database for data persistence

## Installation

1. Navigate to the project directory:
```bash
cd timesheet-app
```

2. Dependencies are already installed. If you need to reinstall:
```bash
npm install
```

## Usage

1. Start the server:
```bash
node server.js
```

2. Open your browser and navigate to:
```
http://localhost:3000
```

3. The app will be running and ready to use!

## API Endpoints

- `GET /api/entries` - Get all time entries (with optional date/project filters)
- `GET /api/entries/:id` - Get a single time entry
- `POST /api/entries` - Create a new time entry
- `PUT /api/entries/:id` - Update a time entry
- `DELETE /api/entries/:id` - Delete a time entry
- `GET /api/projects` - Get all projects
- `GET /api/summary` - Get timesheet summary (with optional date range)

## Database Schema

### time_entries table
- id (INTEGER PRIMARY KEY)
- project_name (TEXT)
- task_description (TEXT)
- start_time (TEXT)
- end_time (TEXT)
- duration_minutes (INTEGER)
- date (TEXT)
- created_at (TEXT)

### projects table
- id (INTEGER PRIMARY KEY)
- name (TEXT UNIQUE)
- created_at (TEXT)

## Features in Detail

### Time Entry Management
- Add new time entries with project name, task description, date, and time range
- Edit existing entries
- Delete entries with confirmation
- Automatic duration calculation in minutes and display in hours/minutes format

### Reporting
- View all time entries in a sortable table
- Filter entries by date range
- Generate summary reports showing total hours by project
- See total hours across all projects

### User Interface
- Clean, modern design with gradient backgrounds
- Responsive layout that works on mobile and desktop
- Form validation
- Success notifications
- Auto-complete for project names based on previous entries

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Middleware**: CORS, Body-Parser

## Project Structure

```
timesheet-app/
├── server.js           # Express server and API routes
├── database.js         # Database setup and schema
├── package.json        # Dependencies
├── timesheet.db        # SQLite database (created automatically)
├── public/
│   ├── index.html     # Main HTML page
│   ├── styles.css     # Stylesheet
│   └── app.js         # Frontend JavaScript
└── README.md          # This file
```

## Tips

- The date field defaults to today's date
- End time is optional - leave it blank for ongoing tasks
- Projects are automatically saved for auto-complete
- Use the summary feature to see total hours by project for billing or reporting
