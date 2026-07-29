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

### 4. Member Management, Multi-Role, Per-Role Salary Benchmarks & Bank Details
- **Member Roster & Spacious 2-Column Modal**: Real-time search bar (by Name, Roblox ID, TikTok, Discord, Bank Name, Account Number, Phone, Email) and category filter pills.
- **Social Handles**: Support for Roblox Username & Nickname, TikTok Handle, and Discord Username (`discord_username`).
- **Multi-Role Support**: Members can hold multiple roles simultaneously (e.g. `["Caster", "Content Creator"]`).
- **Per-Role Benchmark Salary (`role_salaries`)**: Optional nominal + currency configured per role (e.g. Caster: IDR 500,000, Content Creator: IDR 700,000). Total combined salary is automatically computed.
- **Bank & Financial Details**: Storage of Bank/E-Wallet Name (`bank_name`), Account Number (`bank_account_number`), and Account Holder Name (`bank_account_name`).
- **Role-Aware Auto-Populate Salary on Payout**: When selecting a staff member and payout category in `PaymentPage.jsx`, the amount and currency fields automatically pre-fill with that member's specific benchmark salary for that matching role.
- **Full Editability**: Complete edit capability confirmed via edit button (pencil icon) populating all multi-role, bank, and salary data.

### 5. Automatic Event Prize Expense Sync
- When an event winner prize payment status is set to `Paid`, the backend automatically generates a corresponding expense entry in `expenses.json` under category `Event Prize Payout`.
- Automatic sync avoids manual re-entry and updates financial summaries instantly.

### 6. System-Wide i18n Localization & Date Formatting (Indonesian & English)
- Integrated `react-i18next` with complete translation dictionaries (`frontend/src/locales/id.json` and `en.json`).
- All UI elements—including page titles, subtitles, top badges, metric cards, chart labels, table column headers, form input labels, status dropdowns, modal titles, and action buttons—dynamically toggle between **Bahasa Indonesia (`id`)** and **English (`en`)**.
- **Public Landing Page Date Formatting ([dateFormatter.js](file:///c:/laragon/www/agschool/frontend/src/utils/dateFormatter.js))**: All raw ISO dates (e.g. `2026-07-24`) displayed on public event cards and event detail pages are formatted into human-readable locale strings based on the active language:
  - **Bahasa Indonesia (`id`)**: `24 Juli 2026`
  - **English (`en`)**: `24 July 2026`

### 7. League Points System & Dynamic Standings Leaderboard
- **Dual Event Format Support**: Supports both Standard 1-Match Direct events and Multi-Match League Points events.
- **Dynamic Mid-Event Adjustments**: Total match counts (e.g. 3 matches adjusted to 2 matches mid-event), point distribution schemes (Rank #1 = 10pt, Rank #2 = 9pt, etc.), and custom podium winner counts (Top 3, Top 5, Top 10) can be edited at any time during an event.
- **Match-by-Match Placement Matrix**: Admin inputs match placements for finalists; total points are calculated automatically.
- **Automatic Tie-Breaker Engine**: If total points are tied, players are ranked by their single best match placement finish (e.g. `[5, 9]` ranks above `[7, 8]` because finish #5 is superior to #7).
- **1-Click Sync to Prize Winners**: Pushes top N podium winners into the event's official Prize Winner roster with a single click.
- **Public Leaderboard Transparency**: Displays live Standings Table and tie-breaker rationale on the Public Event Details page for community verification.

### 8. Dynamic Placement Schema & Real-Time Participant Search
- **Participant Search**: Standings modal includes a real-time search bar (`Search`) to instantly filter participants by name or team.
- **Dynamic Placement Point Schema Editor**: Custom placement rank counts (e.g. 5, 10, 20, or custom rank count) with instant `Top 5`, `Top 10`, `Top 20` preset buttons.

### 9. Redesigned Prize Management Modal & Public Portal Status Badges
- **2-Column Prize Management Modal ([PrizeModal.jsx](file:///c:/laragon/www/agschool/frontend/src/components/events/PrizeModal.jsx))**: Redesigned into a spacious 2-column layout with real-time search bar for winner names and cleanly grouped payment/currency inputs.
- **Refactored Public Portal**: Cleaned up branding and wording across Public Portal pages.
- **Dual Status Badges on Public Event Cards ([EventCard.jsx](file:///c:/laragon/www/agschool/frontend/src/components/public/EventCard.jsx))**: Every event card displays both **Registration Status** (`🟢 Pendaftaran Buka`, `🔒 Pendaftaran Ditutup`, `⏳ Segera Dibuka`) and **Execution Status** (`● Berlangsung`, `✓ Selesai`, `📅 Dijadwalkan`, `✕ Dibatalkan`).

### 10. Dynamic Updatable Categories for Operational Incomes & Expenses
- **Dynamic Endpoints**: Added `/internal/finance/incomes/categories` and `/internal/finance/expenses/categories` endpoints.
- **Form Select Integration**: Form modal dropdowns on `IncomePage.jsx` and `ExpensePage.jsx` load active custom category options dynamically.
- **Settings Category Management Panel ([SettingsPage.jsx](file:///c:/laragon/www/agschool/frontend/src/pages/SettingsPage.jsx))**: Includes dedicated category configuration cards allowing admins to add, edit, and remove categories for:
  1. 📈 Kategori Pendapatan Operasional (*Operational Income Categories*)
  2. 📉 Kategori Pengeluaran Operasional (*Operational Expense Categories*)
  3. 💸 Kategori Pembayaran Staff (*Staff Payment Categories*)
  4. 👥 Kategori Anggota Staff (*Staff Member Roles*)

### 11. System-Wide Table Pagination & Advanced Date Filtering
- **System-Wide Pagination ([Table.jsx](file:///c:/laragon/www/agschool/frontend/src/components/common/Table.jsx))**: All tables across the application now feature responsive pagination footers with page size selectors (10, 25, 50, 100 per page), previous/next navigation, and data count summary.
- **Date & Category Filter Toolbar ([IncomePage.jsx](file:///c:/laragon/www/agschool/frontend/src/pages/IncomePage.jsx) & [ExpensePage.jsx](file:///c:/laragon/www/agschool/frontend/src/pages/ExpensePage.jsx))**: Refactored filter dropdown aesthetics with dark background option styling, native calendar popup triggers (`showPicker()`), and date period presets (`Semua Tanggal`, `Hari Ini`, `Bulan Ini`, `Pilih Bulan Spesifik...`, `Tahun Ini`, and `Rentang Tanggal Custom...`).
### 12. Payment Status Management for Operational Incomes & Expenses
- **Payment Status Field**: Added `payment_status` (`Paid` 🟢, `Unpaid` 🟡, `Cancelled` 🔴) to modal forms and backend endpoints on `IncomePage.jsx` and `ExpensePage.jsx`.
- **Status Badges & Status Filter**: Tables display interactive status badges (`Paid`, `Unpaid`, `Cancelled`) and filter toolbars include status filters (`Semua Status`, `Paid`, `Unpaid`, `Cancelled`).
### 14. Dedicated Player & Staff Directory & Membership Status Tracking
- **Dedicated Sidebar Menu & Page ([Sidebar.jsx](file:///c:/laragon/www/agschool/frontend/src/components/common/Sidebar.jsx) & [MemberPage.jsx](file:///c:/laragon/www/agschool/frontend/src/pages/MemberPage.jsx))**: Added a dedicated navigation menu item **`Direktori Pemain & Staff`** (`/internal/members`) to directly view, search, and manage staff and tournament player profiles with entity type tab filters (`Semua`, `Staff & Pengurus`, `Pemain & Turnamen`).
- **Membership Status & Joined Date Tracking**: Added **`status`** (🟢 `active` / Aktif vs 🔴 `inactive` / Nonaktif / Berhenti) and **`joined_date`** (Tanggal Masuk / Bergabung) fields to forms and directory tables with status filter toolbar options.
- **Tailored Staff vs Player Forms**: Player form is streamlined (role buttons hidden, category auto-set to `Player`, IGN & bank details focus), while Staff form remains full-featured (multi-role selection & per-role salary benchmarks). Both forms feature prominent **Discord Handle** inputs (`discord_username`).
- **Inline Recipient Auto-Save in Expenses ([ExpensePage.jsx](file:///c:/laragon/www/agschool/frontend/src/pages/ExpensePage.jsx))**: Direct 1-click recipient creation with bank details auto-save directly from operational expense forms.
- **Event Prize Auto-Fill & Auto-Save ([PrizeModal.jsx](file:///c:/laragon/www/agschool/frontend/src/components/events/PrizeModal.jsx))**: 1-click bank account auto-fill for event winners with auto-save to directory option.

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
