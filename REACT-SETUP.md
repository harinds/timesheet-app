# React/TypeScript Frontend Setup Guide

Your timesheet app now has a modern React/TypeScript frontend!

## Quick Start

### Step 1: Install Frontend Dependencies

```bash
cd client
npm install
```

### Step 2: Start Development

Open **TWO** terminal windows:

**Terminal 1 - Backend (Express):**
```bash
# In timesheet-app directory
node server.js
```

**Terminal 2 - Frontend (React):**
```bash
# In timesheet-app/client directory
cd client
npm run dev
```

### Step 3: Open Your Browser

Go to: **http://localhost:5173**

The React app will proxy API requests to your Express backend on port 3000.

## What Was Created

### Frontend Structure
```
client/
├── src/
│   ├── components/
│   │   ├── TimeEntryForm.tsx    # Add/edit time entries
│   │   ├── EntriesList.tsx      # Display entries table
│   │   └── Summary.tsx          # Project summary
│   ├── api.ts                   # API service layer
│   ├── types.ts                 # TypeScript types
│   ├── App.tsx                  # Main component
│   └── main.tsx                 # Entry point
├── vite.config.ts               # Vite config
├── tsconfig.json                # TypeScript config
└── package.json                 # Dependencies
```

### Key Features

1. **Type Safety** - Full TypeScript support with strict mode
2. **Modern Tooling** - Vite for fast development and builds
3. **Component Architecture** - Reusable, maintainable components
4. **API Layer** - Clean separation with Axios
5. **Responsive Design** - Works on desktop and mobile
6. **Error Handling** - User-friendly error messages

## Development Workflow

### Making Changes

1. Edit files in `client/src/`
2. Changes auto-reload instantly (hot module replacement)
3. TypeScript errors show in terminal and browser

### Adding New Features

1. Define types in `src/types.ts`
2. Add API methods in `src/api.ts`
3. Create components in `src/components/`
4. Import and use in `App.tsx`

## Production Deployment

### Build for Production

```bash
cd client
npm run build
```

This creates optimized files in `client/dist/`.

### Serve with Express

The Express server is already configured to serve the React build:

```bash
# Make sure you've built the React app first
cd client
npm run build

# Then start Express
cd ..
node server.js
```

Now open http://localhost:3000 - Express serves the React app!

## Two Development Approaches

### Approach 1: Dual Servers (Recommended for Development)

**Best for:** Active development with hot reload

- Frontend: http://localhost:5173 (Vite dev server)
- Backend: http://localhost:3000 (Express API)
- Vite proxies API requests to Express

**Run both:**
```bash
# Terminal 1
node server.js

# Terminal 2
cd client && npm run dev
```

### Approach 2: Single Server (Recommended for Production)

**Best for:** Production or testing the built app

- Everything: http://localhost:3000 (Express serves React build)

**Steps:**
```bash
cd client
npm run build
cd ..
node server.js
```

## Comparison: Old vs New

### Old (HTML/CSS/JS)
- Located in `public/` folder
- Vanilla JavaScript
- No type safety
- No build process
- Still accessible if React build doesn't exist

### New (React/TypeScript)
- Located in `client/` folder
- React components
- Full TypeScript
- Vite build system
- Modern development experience

**Both still work!** The server falls back to `public/` if the React build doesn't exist.

## Common Tasks

### Install a New Package

```bash
cd client
npm install package-name
```

### Fix TypeScript Errors

```bash
cd client
npm run build  # See all type errors
```

### Update Dependencies

```bash
cd client
npm update
```

### Run Linter

```bash
cd client
npm run lint
```

## Environment Variables

Create `client/.env.local` for local environment variables:

```env
VITE_API_URL=http://localhost:3000/api
```

Access in code:
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

## Troubleshooting

**Problem:** "Cannot GET /api/entries"
- Solution: Make sure Express backend is running on port 3000

**Problem:** "npm: command not found"
- Solution: Install Node.js from https://nodejs.org

**Problem:** Port 5173 already in use
- Solution: Kill the process using port 5173 or change the port in `vite.config.ts`

**Problem:** TypeScript errors
- Solution: Check `src/types.ts` for type definitions
- Run `npm run build` to see all errors

**Problem:** Changes not reflecting
- Solution: Check terminal for errors, try restarting dev server

## VS Code Integration

Recommended extensions:
- ESLint
- TypeScript and JavaScript Language Features
- Vite

## Next Steps

Now that you have React/TypeScript frontend:

1. ✅ Modern component architecture
2. ✅ Type-safe development
3. ✅ Fast hot module replacement
4. ✅ Production-ready builds

**Enhance your app:**
- Add React Router for multiple pages
- Add state management (Context API or Zustand)
- Add unit tests with Vitest
- Add E2E tests with Playwright
- Add a UI library (Material-UI, Chakra UI, etc.)

Happy coding!
