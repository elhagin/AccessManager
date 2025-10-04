# Access Manager

Lightweight access token manager with a Next.js frontend and an Express backend.

## Project Structure

```
access-manager/
├── frontend/   # Next.js application (App Router, TypeScript, Tailwind)
└── backend/    # Express server (TypeScript)
```

## Prerequisites

- Node.js v22.20.0 (install via `nvm install 22.20.0`)
- npm 10.9.3 (shipped with Node 22.20.0)

## Getting Started

### 1. Clone this repository

```bash
git clone <repo-url>
cd access-manager
```

### 2. Install dependencies

```bash
cd frontend
npm install

cd ../backend
npm install
```

### 3. Run the development servers

In one terminal tab, start the backend (defaults to port `4000`):

```bash
cd backend
npm run dev
```

In another tab, start the frontend (defaults to port `3000`):

```bash
cd frontend
npm run dev
```

## Available Scripts

### Frontend (`frontend/`)

- `npm run dev` – start Next.js dev server with Tailwind hot reload
- `npm run build` – build production bundle
- `npm run start` – run production server
- `npm run lint` – run ESLint

### Backend (`backend/`)

- `npm run dev` – start Express server with live reload (`nodemon`)
- `npm run build` – compile TypeScript to `dist/`
- `npm run start` – run compiled server

## Next Steps

- Implement `/api/tokens` on the backend to return mock token data
- Build the Access Manager UI in the frontend (table, filters, renew button)

## Notes

- Ensure both servers are running for full functionality during development
- Update environment variables and configuration as needed once real services are integrated


