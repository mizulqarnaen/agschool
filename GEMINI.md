# agschool Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-07-24

## Active Technologies
- Frontend: React 19, Vite, JavaScript (ES6+), Tailwind CSS, React Router, Axios, Lucide React, Chart.js, React Hot Toast, i18next, SheetJS (xlsx) (001-srs-ag-school-finance)
- Backend: Node.js (LTS), Express.js, JWT (jsonwebtoken), bcrypt, Multer, Express Validator (001-srs-ag-school-finance)
- Storage: Structured JSON Files (`backend/data/*.json`). Uploaded Assets: Server filesystem (`backend/uploads/`). Strictly NO SQLite, MySQL, PostgreSQL, MongoDB, Firebase, or Supabase. (001-srs-ag-school-finance)

## Project Structure

```text
backend/
├── data/            # JSON storage files (incomes, expenses, payments, members, events, prizes, users, settings, logs)
├── uploads/         # Server filesystem file storage
├── src/
│   ├── controllers/
│   ├── middleware/
│   ├── repositories/
│   ├── services/
│   └── routes/
└── server.js

frontend/
├── src/
│   ├── components/  # Reusable React components & Modals
│   ├── locales/     # i18n translation dictionaries (id.json & en.json)
│   ├── pages/       # Public & Internal pages
│   ├── services/    # Axios REST API services
│   └── context/     # Auth Context
├── index.html
└── vite.config.js
```

## Commands

- Backend dev server: `cd backend && npm run dev`
- Frontend dev server: `cd frontend && npm run dev`
- Frontend production build: `cd frontend && npm run build`

## Code Style

- Frontend: Functional React 19 components, Hooks, ES6+ modules, Tailwind CSS, i18next (`t(...)`)
- Backend: ES6 Node.js / Express modules, Repository Pattern for JSON data access

## Recent Changes
- 002-localization-currency: Implemented system-wide i18n localization (ID/EN), dynamic member & payment categories, auto-synced paid prize expenses, opening cash balance (initial balance), optional member monthly salary benchmarks with payout auto-fill, and full documentation.
- 001-srs-ag-school-finance: Mandated React 19 + Vite + Tailwind CSS + Node.js (Express) + JSON File Storage stack.

<!-- MANUAL ADDITIONS START -->
- Full System Documentation: Refer to `README.md` in root directory.
<!-- MANUAL ADDITIONS END -->
