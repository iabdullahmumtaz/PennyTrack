# PennyTrack

Expense tracker SaaS with charts, budgets, CSV/PDF exports, and team expense sharing.

## Features

- Dashboard with pie and bar charts (Recharts)
- Expense tracking by category and date
- Budget limits with progress bars and alerts
- Team creation and member invites
- CSV and PDF report exports
- Multi-page UI: dashboard, expenses, budgets, teams, exports

## Tech Stack

| Layer    | Technology              |
|----------|-------------------------|
| Backend  | TypeScript, Node.js, Express, Mongoose, tsx |
| Frontend | TypeScript, React, Vite, React Router       |
| Charts   | Recharts (typed components)                 |
| Export   | PDFKit                  |

## Ports

| Service | Port |
|---------|------|
| UI      | 5023 |
| API     | 6023 |

## Quick Start

```bash
cp .env.example .env
npm run install:all
npm run dev
```

- **UI:** http://localhost:5023
- **API:** http://localhost:6023

## Project Structure

```
PennyTrack/
├── backend/          # Express API
├── frontend/         # React dashboard
├── docker-compose.yml
└── package.json
```

## License

MIT
