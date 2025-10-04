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

### 3. Configure environment variables

Create `.env` files from the provided examples and fill in secure values:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Key variables:

- `backend/.env`
  - `PORT`: Express server port (defaults to 4000)
  - `SERVER_URL`: Public URL for Swagger docs (defaults to `http://localhost:PORT`)
  - `JWT_SECRET`: Secret used to sign renewal JWTs **(required)**
  - `RENEWAL_DURATION_DAYS`: Days added on renew (defaults to 90)
- `frontend/.env`
  - `NEXT_PUBLIC_API_BASE_URL`: URL pointing to the backend (defaults to `http://localhost:4000`)

### 4. Run the development servers

In one terminal tab, start the backend (defaults to port `4000`):

```bash
cd backend
npm run dev
```

In another tab, start the frontend (defaults to port `3000`, fallback to `3001` if occupied):

```bash
cd frontend
npm run dev
```

When testing token renewal, you need a JWT signed with the backend secret. Generate one locally (replace the token id as needed):

```bash
cd backend
node -e "const jwt=require('jsonwebtoken');console.log(jwt.sign({ tokenId: 'token-1' }, process.env.JWT_SECRET || 'replace-with-secure-secret', { expiresIn: '90d' }));"
```

Paste the resulting token into the frontend renew modal (Authorization field). The UI automatically prefixes it with `Bearer` and shows the newly issued JWT after a successful renew.

Swagger docs are available at `http://localhost:<PORT>/docs` once the backend is running.
The OpenAPI specification lives at `backend/openapi.yaml` and powers both the Swagger UI and importable client references.

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

## Notes

- Ensure both servers are running for full functionality during development
- Update environment variables and configuration as needed once real services are integrated


