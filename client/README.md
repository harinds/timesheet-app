# Timesheet App - React/TypeScript Frontend

Modern React/TypeScript frontend for the Timesheet application.

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Fast build tool and dev server
- **Axios** - HTTP client
- **CSS3** - Styling with responsive design

## Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── TimeEntryForm.tsx    # Form to add/edit time entries
│   │   ├── EntriesList.tsx      # Table of all time entries
│   │   └── Summary.tsx          # Summary by project
│   ├── api.ts                   # API service layer
│   ├── types.ts                 # TypeScript interfaces
│   ├── App.tsx                  # Main app component
│   ├── App.css                  # App styles
│   ├── main.tsx                 # Entry point
│   └── index.css                # Global styles
├── index.html                   # HTML template
├── vite.config.ts               # Vite configuration
├── tsconfig.json                # TypeScript config
└── package.json                 # Dependencies
```

## Getting Started

### 1. Install Dependencies

```bash
cd client
npm install
```

### 2. Development Mode

Start the React dev server (with hot reload):

```bash
npm run dev
```

This will start the app at http://localhost:5173

**Important:** Make sure your Express backend is running on port 3000:
```bash
# In the parent directory
node server.js
```

The Vite dev server will proxy API requests to the backend automatically.

### 3. Production Build

Build for production:

```bash
npm run build
```

This creates optimized files in the `dist` folder.

### 4. Preview Production Build

Test the production build locally:

```bash
npm run preview
```

## Features

### TimeEntryForm Component
- Add new time entries
- Edit existing entries
- Auto-complete for project names
- Form validation
- Duration auto-calculation

### EntriesList Component
- Display all time entries in a table
- Edit and delete entries
- Formatted dates and durations
- Refresh button
- Empty state handling

### Summary Component
- Filter by date range
- Total hours by project
- Grand totals
- Loading and error states

## API Integration

The app communicates with the Express backend via the API service layer (`src/api.ts`):

- `GET /api/entries` - Get all time entries
- `POST /api/entries` - Create new entry
- `PUT /api/entries/:id` - Update entry
- `DELETE /api/entries/:id` - Delete entry
- `GET /api/projects` - Get all projects
- `GET /api/summary` - Get summary by date range

## TypeScript Types

All data models are defined in `src/types.ts`:

- `TimeEntry` - Time entry model
- `Project` - Project model
- `TimeEntrySummary` - Summary data
- `CreateTimeEntryDTO` - Create entry payload
- `UpdateTimeEntryDTO` - Update entry payload

## Styling

- Responsive design (mobile-friendly)
- Gradient backgrounds
- Modern card-based layout
- Hover effects and transitions
- Consistent color scheme matching the brand

## Development Tips

### Hot Module Replacement
Vite provides instant hot module replacement. Changes to your code will reflect immediately without page refresh.

### TypeScript
The project uses strict TypeScript. Make sure to:
- Define proper types for all props
- Use interfaces from `types.ts`
- Avoid `any` types

### API Errors
All API calls include error handling with user-friendly messages.

## Deployment

### Option 1: Serve from Express (Recommended)

1. Build the React app:
   ```bash
   npm run build
   ```

2. The Express server is already configured to serve the built files from `client/dist`

3. Start the Express server:
   ```bash
   cd ..
   node server.js
   ```

4. Access the app at http://localhost:3000

### Option 2: Deploy Separately

Deploy the React app to:
- Vercel
- Netlify
- GitHub Pages

Update the API base URL in `src/api.ts` to point to your backend server.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

**Issue:** "Cannot connect to backend"
- Make sure Express server is running on port 3000
- Check CORS configuration in server.js

**Issue:** "Module not found" errors
- Run `npm install` to install dependencies
- Delete `node_modules` and run `npm install` again

**Issue:** TypeScript errors
- Run `npm run build` to see all type errors
- Check `tsconfig.json` for configuration

## Next Steps

Potential enhancements:
- Add React Router for multiple pages
- Add authentication
- Export to CSV from frontend
- Real-time updates with WebSockets
- Dark mode toggle
- Drag-and-drop time entry creation
- Charts and visualizations
