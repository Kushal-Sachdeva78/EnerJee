# EnerJee

EnerJee is a renewable energy planning platform for Indian regions. It simulates hourly solar, wind, hydro, and demand profiles for six cities, visualizes cost, emissions, and reliability trade-offs in an interactive dashboard, and includes a fully client-side smart city investment simulator.

![TypeScript](https://img.shields.io/badge/TypeScript-React%2018%20%2B%20Vite-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

- **Forecasting engine**: a deterministic, seeded simulation (`server/forecasting.ts`) that generates hourly solar, wind, hydro, and demand profiles for six Indian regions (Jodhpur, Bangalore, Chennai, Kutch, Uttarakashi, Satara), each with region-specific generation multipliers and baseline demand. Five forecast methods are supported, spanning 24-hour, 90-day, and 1-year projections. Results are reproducible per region and method.
- **Optimization dashboard**: a config sidebar for region, forecast method, energy focus, and a cost-versus-emissions priority slider; a results table comparing the optimized mix against a greedy baseline on cost (Rs/MWh), emissions (kg CO2), and reliability; a stacked area chart of the energy mix with a demand overlay; a price analysis chart; and one-click CSV export of results.
- **Smart City simulator**: allocate an investment budget across solar, wind, hydro, and tidal for five cities, then run simulations with weather variation and random events to get energy output, budget remaining, CO2 savings, public satisfaction, and a sustainability rank, with charts that track history across runs. This feature runs entirely in the browser.
- **AI energy mentor**: a chat interface (EnerJeePT) designed to explain optimization results in natural language.
- **Persistence schema**: a Drizzle ORM Postgres schema (`shared/schema.ts`) for users, sessions, and optimization run history, storing config, optimized and baseline metrics, and chart data for each run.

## Tech stack

- **Frontend**: React 18, TypeScript, Vite, Wouter, TanStack Query, Tailwind CSS, Radix UI (shadcn/ui), Recharts, react-hook-form, Zod
- **Backend**: Express, Drizzle ORM, Neon serverless Postgres, OpenAI SDK
- **Tooling**: esbuild, drizzle-kit, tsx

## Project structure

```
client/         # Vite + React SPA (pages, dashboard, simulator, chat, UI components)
server/         # Forecasting engine and database client
shared/         # Drizzle ORM schema and shared API types
```

> **Repository status**: the current tree contains the full client, the forecasting engine, and the database schema. The Express API layer (entry point, routes, optimizer, and chat endpoints) is preserved in the git history but is not present in the current tree. Because the server entry point also serves the client, the app does not run from a fresh checkout until that layer is restored.

## Running (as designed)

Prerequisites: Node.js 18+, a Postgres database (Neon serverless recommended), and access to an OpenAI-compatible endpoint. Once the server layer is restored from history, the standard commands are:

```bash
npm install
npm run db:push   # create tables defined in shared/schema.ts
npm run dev       # start the Express + Vite development server
```

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Postgres connection string used by Drizzle and session storage |
| `SESSION_SECRET` | Secret for signing Express session cookies |
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | Base URL of the OpenAI-compatible API endpoint |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | API key for that endpoint |

The login screen displays the demo credentials (`demo1234` / `123456`).

## Presentation

Watch our winning final-day presentation and pitch from the ShriTeq hackathon on [YouTube](https://www.youtube.com/live/LGFVDkK_wTc?si=JxyeFbUaWO9nvIlh&t=8063).

## Related projects

- [VVS-Ballers-RoboCup](https://github.com/Kushal-Sachdeva78/VVS-Ballers-RoboCup): autonomous RoboCupJunior Soccer robots (9th place, RoboCup 2026)
- [RFID](https://github.com/Kushal-Sachdeva78/RFID): RFID attendance system prototype for Vasant Valley School
- [PQ-Identity-Prototype](https://github.com/Kushal-Sachdeva78/PQ-Identity-Prototype): post-quantum digital identity prototype (IEEE Access)

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
