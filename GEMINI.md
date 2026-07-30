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

## Data Integrity & Preservation Guarantees

1. **Non-Destructive Schema Evolution**: Any new feature or field addition MUST maintain 100% backward compatibility. Existing stored data in JSON files (`backend/data/*.json`) must NEVER be overwritten, cleared, or lost during schema migrations or feature updates. Always provide default fallbacks when reading legacy records (`item.categories || [item.category]`).
2. **Immutable Financial Snapshots**: Recorded transactions (Incomes, Expenses, Payments, Logs) store exact snapshot values (`exchange_rate_used`, `base_amount_idr`, `amount`, `currency`, `member_name`) captured at the transaction time. Subsequent changes to settings, exchange rates, or member profiles MUST NEVER retroactively modify historical financial entries.

## Recent Changes
- 014-login-page-cleanup-and-session-expiry-redirect: Replaced `Shield` icon with official AG School logo (`/logo.png`) on `LoginPage.jsx`, refined container size, padding (`p-2.5`), and inner `rounded-xl` image clipping, removed demo account text footer, and implemented automatic session expiry redirection (handling HTTP status codes 401 and 403) to `/login` via Axios interceptor in `api.js` and `ProtectedRoute` in `App.jsx`.
- 013-membership-status-and-joined-date: Added **Tanggal Masuk / Bergabung** (`joined_date`) and **Status Keanggotaan** (`status`: 🟢 `active` / Aktif vs 🔴 `inactive` / Nonaktif / Berhenti) fields, status table badges, and status filter toolbars to `MemberPage.jsx` and `MemberModal.jsx`.
- 012-tailored-player-vs-staff-forms-and-discord-handle: Streamlined Player form (role selection hidden, auto-set to `Player`, IGN & bank focus) while keeping Staff form fully featured (multi-role & salary benchmarks), and ensured **Discord Handle** (`discord_username`) is prominently featured across both forms (`MemberPage.jsx` & `MemberModal.jsx`).
- 011-dedicated-directory-menu-and-inline-recipient-creation: Added dedicated Sidebar menu & page **`Direktori Pemain & Staff`** (`/internal/members` -> `MemberPage.jsx`), and implemented direct inline recipient creation with bank details auto-save directly inside `ExpensePage.jsx` modal form.
- 010-unified-recipient-directory-and-linking: Implemented Unified Master Directory for Players & Staff (`MemberModal.jsx`), 1-click Bank Details Auto-Fill & Auto-Save on Event Prizes (`PrizeModal.jsx`), and Recipient Member Linking on Operational Expenses (`ExpensePage.jsx`).
- 009-summary-cards-category-breakdown: Implemented reactive Financial Summary Cards (Total Paid 🟢, Total Unpaid 🟡, Total Cancelled 🔴, Total Filtered) and Grouped Category Breakdown Panels on `IncomePage.jsx` and `ExpensePage.jsx`, fully reactive to date, status, and search filters.
- 008-payment-status-incomes-expenses: Added `payment_status` (`Paid` 🟢, `Unpaid` 🟡, `Cancelled` 🔴) to modal forms, table status badge columns, and filter toolbars on `IncomePage.jsx` and `ExpensePage.jsx`, and integrated payment status filters into `financeController.js` dashboard net cash balance calculations.
- 007-system-wide-pagination-and-date-filters: Implemented responsive pagination into `Table.jsx` (10, 25, 50, 100 per page, page navigation, data count summary), added Date & Month Filter Toolbars to `IncomePage.jsx`, `ExpensePage.jsx`, and `InternalDashboard.jsx` (with `selected_month`, custom date range, and native `showPicker()` calendar popup triggers), and styled dark dropdown options.
- 006-updatable-income-expense-categories: Implemented dynamic endpoints (`/internal/finance/incomes/categories` and `/expenses/categories`), dynamic form dropdowns on `IncomePage.jsx` and `ExpensePage.jsx`, and a comprehensive Category Management Panel on `SettingsPage.jsx`.
- 005-prize-modal-and-public-portal-enhancements: Redesigned PrizeModal into 2-column layout with real-time winner search, added real-time participant search to LeagueStandingsModal, enabled dynamic placement rank counts & presets, updated public portal wording, and added dual status badges (Registration & Execution) to Event Cards.
- 004-league-points-system: Implemented Dual Event Formats (Standard vs League), dynamic match counts, custom placement point schemas, match placement matrix, automatic best-finish tie-breaker engine, 1-click sync to prize winners, and public leaderboard transparency portal.
- 003-multi-role-bank-details: Implemented multi-role category assignments for staff members, per-role salary benchmarks (`role_salaries`), automatic role-matching payout auto-fill in `PaymentPage.jsx`, member bank account storage (`bank_name`, `bank_account_number`, `bank_account_name`), and full documentation.
- 002-localization-currency: Implemented system-wide i18n localization (ID/EN), dynamic member & payment categories, auto-synced paid prize expenses, opening cash balance (initial balance), optional member monthly salary benchmarks with payout auto-fill, and full documentation.
- 001-srs-ag-school-finance: Mandated React 19 + Vite + Tailwind CSS + Node.js (Express) + JSON File Storage stack.

<!-- MANUAL ADDITIONS START -->
- Full System Documentation: Refer to `README.md` in root directory.
<!-- MANUAL ADDITIONS END -->
