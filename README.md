# AG School - Comprehensive System Documentation

## Overview
**AG School Finance & Event Transparency Portal** is an enterprise-grade financial management and public event transparency web application built for **AG School**. It provides dual functionality:
1. **Public Transparency Portal**: Public-facing website where community members can view upcoming & past esports/school events, tournament posters, official winner lists, prize amounts, and real-time payment statuses (Lunas/Terbayar, Processing, Belum Dibayar).
2. **Internal Management System**: Secure dashboard for Administrators, Finance Team, and Secretaries to record operational incomes/expenses, manage internal staff profiles & monthly salary benchmarks, track staff payouts, configure system currency/exchange rates, set initial starting cash balances, manage user roles, and export native Excel (.xlsx) / CSV reports.

---

## Technical Stack & Architecture

- **Frontend**: React 19, Vite, Tailwind CSS, React Router v6, Axios, Lucide React Icons, Chart.js (`react-chartjs-2`), i18next (`react-i18next`), React Hot Toast, SheetJS (`xlsx`).
- **Backend**: Node.js (LTS), Express.js framework, JSON Web Tokens (`jsonwebtoken`), bcrypt password hashing, Express Validator, Repository Pattern.
- **Storage Strategy**: Structured JSON Files in `backend/data/*.json` (`incomes.json`, `expenses.json`, `payments.json`, `members.json`, `events.json`, `prizes.json`, `users.json`, `settings.json`, `logs.json`). Uploaded posters in `backend/uploads/`. Strictly zero external database engines (No MySQL, SQLite, PostgreSQL, MongoDB, or Firebase).

---

## Detailed Features & System Enhancements

### 1. Initial Starting Cash Balance (Saldo Kas Awal) & Date Filtering
- **Dashboard & Report Date Period Filters**: Filter dashboard metrics and report exports dynamically by date period:
  - **Semua Waktu (All Time)** — *Default*
  - **Hari Ini (Today)**
  - **Bulan Ini (This Month)**
  - **Tahun Ini (This Year)**
  - **Rentang Custom (Custom Range)** with `startDate` & `endDate` inputs.
- Configurable opening balance parameter stored in `settings.json` under `initial_balance_idr`.
- **Net Cash Balance Formula (Saldo Kas Net)**:
  $$\text{Saldo Kas Net} = \text{Saldo Kas Awal (IDR)} + \text{Total Pendapatan (IDR)} - \text{Total Combined Expense (IDR)}$$
  Where $\text{Total Combined Expense} = \text{Operational Expenses} + \text{Staff Member Payouts} + \text{Paid Event Prizes}$.
- Ensures zero double-counting by soft-syncing paid event prizes directly into operational expenses.

### 2. Multi-Currency System & Global Setting
- System supports dual transaction currencies: **IDR (Indonesian Rupiah)** and **SGD (Singapore Dollar)**.
- **System-Wide Default Currency Setting**: Setting default currency in Settings (`IDR` / `SGD`) automatically updates the default currency in all creation modals (`IncomePage`, `ExpensePage`, `PaymentPage`, `EventFormModal`).
- **Real-Time Exchange Rate Engine**: Supports **Manual Admin Input** or **Automatic Live Provider Sync** (`ExchangeRate-API` / Open Exchange Rates).
- Live currency converter calculator widget integrated directly into the Settings page.

### 3. Dynamic Categories Configuration
- **Member Categories**: Dynamic admin management of staff roles (`BA`, `Caster`, `Maintainer`, `Secretary`, `Staff`, `Content Creator`, etc.) via API `/internal/finance/members/categories`.
- **Payment Categories**: Dynamic admin management of payout categories (`BA payment`, `Caster payment`, `Maintainer fee`, `Secretary stipend`, `Other payout`, etc.) via API `/internal/finance/payments/categories`.

### 4. Member Management & Monthly Salary Benchmarks
- **Member Roster & Spacious 2-Column Modal**: Real-time search bar (by Name, Roblox ID, TikTok, Phone, Email) and category filter pills.
- **Optional Social & Benchmark Fields**:
  - Roblox Username & Nickname
  - TikTok Handle
  - Email & Phone
  - **Monthly Salary Benchmark (Gaji / Honor Bulanan Acuan)**: Optional nominal + currency (`monthly_salary` & `salary_currency`).
- **Auto-Populate Salary on Payout**: When selecting a staff member in the Member Payment modal (`PaymentPage.jsx`), the amount and currency fields automatically pre-fill with that member's configured benchmark salary.
- **Full Editability**: Complete edit capability confirmed via edit button (pencil icon) populating all profile and salary data.

### 5. Automatic Event Prize Expense Sync
- When an event winner prize payment status is set to `Paid`, the backend automatically generates a corresponding expense entry in `expenses.json` under category `Event Prize Payout`.
- Automatic sync avoids manual re-entry and updates financial summaries instantly.

### 6. System-Wide i18n Localization & Date Formatting (Indonesian & English)
- Integrated `react-i18next` with complete translation dictionaries (`frontend/src/locales/id.json` and `en.json`).
- All UI elements—including page titles, subtitles, top badges, metric cards, chart labels, table column headers, form input labels, status dropdowns, modal titles, and action buttons—dynamically toggle between **Bahasa Indonesia (`id`)** and **English (`en`)**.
- **Public Landing Page Date Formatting ([dateFormatter.js](file:///c:/laragon/www/agschool/frontend/src/utils/dateFormatter.js))**: All raw ISO dates (e.g. `2026-07-24`) displayed on public event cards and event detail pages are formatted into human-readable locale strings based on the active language:
  - **Bahasa Indonesia (`id`)**: `24 Juli 2026`
  - **English (`en`)**: `24 July 2026`

---

## API Endpoints Summary

### Public Endpoints
- `GET /public/events`: Fetch public list of events & prize pool details.
- `GET /public/events/:id`: Fetch single event detail with poster and winners list.

### Internal Financial Endpoints
- `GET /internal/finance/dashboard`: Calculate net cash balance, initial starting balance, total income, total expenses, staff payouts, paid prizes, and active exchange rate.
- `GET / POST / PUT / DELETE /internal/finance/incomes`: Operational Incomes CRUD.
- `GET / POST / PUT / DELETE /internal/finance/expenses`: Operational Expenses CRUD.
- `GET / POST / PUT / DELETE /internal/finance/payments`: Member Payouts CRUD.
- `GET / POST /internal/finance/payments/categories`: Payment Categories configuration.
- `GET / POST / PUT / DELETE /internal/finance/members`: Staff Members CRUD.
- `GET / POST /internal/finance/members/categories`: Member Categories configuration.

### System & Admin Endpoints
- `GET / POST /internal/admin/settings`: Read/write organization profile, initial cash balance, default currency, default language, and exchange rate mode.
- `POST /internal/admin/settings/sync-rate`: Trigger live exchange rate sync.
- `GET / POST / PUT /internal/admin/users`: User account management.
- `GET /internal/admin/logs`: Audit activity log trail.

---

## How to Run locally

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
