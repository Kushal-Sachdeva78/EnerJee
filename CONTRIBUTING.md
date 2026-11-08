# Contributing

EnerJee is a renewable energy planning platform for Indian regions: a React and TypeScript client,
a seeded forecasting engine and a Drizzle ORM schema. The Express API layer is not in the current
tree (see the Repository status note in the README), so the app does not run from a fresh checkout yet.

## How to engage

- **Questions and problems** — open an issue and say what you ran, your Node.js version and your OS.
- **Pull requests** — fixes to the client, the forecasting engine (`server/forecasting.ts`) and the
  docs are welcome. Run `npm run check` (the TypeScript typecheck) before opening one, and say in the
  PR if it already failed before your change.
- **Response time** — I aim to reply to every new issue within 24 hours
  (India Standard Time). If I'm slower than that, I'll say so on the issue
  rather than leave it silent.

## Ground rules

1. Keep the forecasting engine deterministic: results must stay reproducible per region and forecast method.
2. Never commit secrets. Put `DATABASE_URL`, `SESSION_SECRET` and the API key variables in a local `.env`
   file, which is git-ignored.
3. `npm run dev` and `npm run build` need the server entry point (`server/index.ts`), which is not in the
   tree yet, so they fail until that layer is restored.

## Code of conduct

Be respectful and constructive. This is a student project; good-faith questions
and careful, well-documented contributions are appreciated.
