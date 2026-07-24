# Implementation Plan: Localization & Multi-Currency Management

**Branch**: `002-localization-currency` | **Date**: 2026-07-24 | **Spec**: [spec.md](file:///c:/laragon/www/agschool/specs/002-localization-currency/spec.md)  
**Input**: Feature specification from `/specs/002-localization-currency/spec.md`.

## Summary

This feature adds full Localization (`i18next` with Indonesian default and English support), Multi-Currency management (`IDR` base currency and `SGD` transaction entry), and Exchange Rate Auto/Manual Sync Engine to AG School Finance. Every transaction snapshot-records its original currency, original amount, exchange rate used, and converted base IDR amount to ensure 100% historical financial immutability.

## Technical Context

**Language/Version**: JavaScript (ES6+ / Node.js LTS)  
**Frontend Stack**: React 19, Vite, Tailwind CSS, `i18next`, `react-i18next`, Axios, Lucide React, Chart.js  
**Backend Stack**: Node.js (LTS), Express.js, JWT, bcrypt, Multer, Express Validator  
**Storage**: Primary Storage: Structured JSON Files (`backend/data/*.json`). Uploaded Assets: Server filesystem (`backend/uploads/`). Strictly NO SQLite, MySQL, PostgreSQL, MongoDB, Firebase, or Supabase.  
**Architecture Type**: Decoupled React SPA + Express REST API  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I (Simplicity)**: PASSED — Standard `i18next` translation dictionaries without complex cloud external engines.
- **Principle II & III (Modular Architecture & Privacy)**: PASSED — Clean separation of locale dictionaries and private financial currency conversions.
- **Principle VII (Technology Stack Compliance)**: PASSED — Strictly adheres to React 19, Vite, Tailwind CSS, Node.js, Express, and JSON File Storage.

## Project Structure

```text
c:/laragon/www/agschool/
├── backend/
│   ├── data/            # JSON storage (settings.json, incomes.json, etc.)
│   └── src/
│       ├── services/    # currencyService.js (Auto/Manual exchange rate sync)
│       └── routes/      # adminRoutes.js (exchange rate sync endpoints)
└── frontend/
    └── src/
        ├── locales/     # id.json, en.json translation dictionaries
        ├── i18n.js      # i18next initialization
        └── components/  # LanguageSelector component
```

## Technical Diagrams

### Data Design Decisions

| Resource | JSON Storage File | Mapping | Rationale |
| -------- | ----------------- | ------- | --------- |
| Language Preference | `users.json` / `localStorage` | Attribute | Stores `preferred_language` (`id`/`en`) |
| Exchange Rate Config | `settings.json` | Key-Value | Stores mode (`manual`/`auto`), active rate, provider info |
| Transaction Snapshot | `incomes.json`, `expenses.json`, `payments.json`, `prizes.json` | Attributes | Stores `amount`, `currency`, `exchange_rate_used`, `base_amount_idr` |
