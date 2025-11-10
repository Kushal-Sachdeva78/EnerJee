# EnerJee

EnerJee is a full-stack renewable energy planning assistant that combines deterministic forecasting, an optimization engine, and an AI mentor to help utilities or microgrid operators explore the best energy mix for major Indian regions. The project exposes an interactive dashboard that visualises cost, emissions, and reliability trade-offs while persisting optimisation runs for later review. Explore the hosted demo at [enerjee.replit.app](https://enerjee.replit.app).

## Features

- **Scenario forecasting** – Simulates hourly solar, wind, hydro, and demand profiles for key Indian cities with region-specific multipliers.
- **Optimisation engine** – Balances cost versus emission priorities to recommend an ideal generation mix while highlighting baseline comparisons.
- **AI energy mentor** – Provides contextual natural-language explanations of optimisation results powered by OpenAI-compatible APIs.
- **Session-backed auth** – Includes demo credentials with Postgres-backed sessions using Drizzle ORM and Replit Auth compatible schemas.
- **Persistent history** – Saves each optimisation result to Postgres for quick recall and comparison inside the dashboard.

## Tech stack

- **Frontend:** React 18, Vite, TanStack Query, Tailwind CSS, Radix UI primitives
- **Backend:** Express, TypeScript, Drizzle ORM, Neon/Postgres, OpenAI SDK
- **Tooling:** Vite bundler, esbuild, drizzle-kit for schema sync

## Project structure

```
client/         # Vite + React SPA
server/         # Express server, forecasting & optimisation engines
shared/         # Shared Drizzle ORM schema & Zod helpers
components.json # shadcn/ui component registry
```

## Prerequisites

- Node.js 18+
- A Postgres database (Neon serverless recommended)
- Access to an OpenAI-compatible endpoint (Replit AI Integrations or your own proxy)

## Environment variables

Create a `.env` file (or configure your hosting provider) with the following values:

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Connection string for your Postgres instance used by Drizzle and session storage. |
| `SESSION_SECRET` | Secret string for signing Express session cookies. |
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | Base URL for the OpenAI-compatible API endpoint. |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | API key for the OpenAI-compatible endpoint. |

## Getting started

```bash
npm install
npm run db:push   # create tables defined in shared/schema.ts
npm run dev       # starts Express + Vite in development mode on port 5000
```

The demo credentials configured in `server/testAuth.ts` are:

```
username: demo1234
password: 123456
```

Visit `http://localhost:5000` to access the login screen and dashboard.

## Production build

```bash
npm run build  # builds the client and bundles the server to dist/
npm run start  # runs the compiled server in production mode
```

Ensure your production environment exposes the same environment variables listed above before starting the app.

## Database management

Drizzle is configured via `drizzle.config.ts`. To push schema changes run:

```bash
npm run db:push
```

You can explore and generate typed schemas from an existing database using drizzle-kit CLI commands described in their documentation.

## Testing

The repository currently relies on manual and integration testing through the dashboard. Add Vitest or Jest for automated coverage as the project evolves.

## License

MIT
