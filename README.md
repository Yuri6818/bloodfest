# BloodFest

A dark fantasy RPG where players take on the roles of supernatural creatures in a world of gothic horror.

## Requirements

- Node.js (v18.0.0 or higher)
- npm (latest version)
- PowerShell (for Windows users)

## Quick Setup

1. Run the setup script to install all dependencies and build the backend:

```powershell
powershell -File setup-project.ps1
```

2. Start the development servers (frontend and backend):

```
npm run dev
```

The application will be available at http://localhost:5175

## Manual Setup

If you prefer to set up manually:

1. Install frontend dependencies:
```
npm install
```

2. Install backend dependencies:
```
cd backend
npm install
```

3. Build the backend TypeScript files:
```
npm run build
cd ..
```

4. Start the development servers:
```
npm run dev
```

## Available Commands

- `npm run dev` - Start both frontend and backend development servers
- `npm run dev:frontend` - Start only the frontend server
- `npm run backend` - Start only the backend server
- `npm run backend:seed` - Seed the database and start the backend server
- `npm run build` - Build the frontend for production
- `npm run lint` - Run ESLint to check for code issues

## Project Structure

- `/src` - Frontend React/TypeScript code
- `/backend` - Backend Express/TypeScript API
  - `/models` - Mongoose database models
  - `/routes` - API routes
  - `/middleware` - Express middleware
  - `/utils` - Utility functions

## Technologies

- **Frontend**: React, TypeScript, Vite, TailwindCSS
- **Backend**: Node.js, Express, TypeScript, MongoDB
- **State Management**: Zustand
- **API Communication**: Axios
- **Authentication**: JWT
