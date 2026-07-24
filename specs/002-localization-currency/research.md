# Research & Technical Decisions: Localization & Multi-Currency Management

**Feature**: `002-localization-currency`  
**Date**: 2026-07-24  

## Overview

This research document details the technical implementation approach for adding **Localization** (Indonesian default & English) and **Multi-Currency & Exchange Rate Sync** (IDR default & SGD, Auto/Manual Sync Mode).

---

## 1. Localization Architecture (i18n)

### Decision
- **Library**: `i18next` and `react-i18next` on React 19 frontend.
- **Translation Files**:
  - `frontend/src/locales/id.json` (Bahasa Indonesia - Default)
  - `frontend/src/locales/en.json` (English)
- **Language Detection & Persistence**:
  - Priority: Saved user profile setting (for logged-in users) → `localStorage` (`app_lang`) → Default (`id`).
  - i18n instance initialized in `frontend/src/i18n.js` and imported in `main.jsx`.

### Rationale
- `react-i18next` is the industry standard for React applications, supporting instant language switches (< 50ms) without page reloads.
- Locale dictionary files (`id.json`, `en.json`) allow adding future languages (e.g. `zh.json`, `ja.json`) cleanly without code modifications.

---

## 2. Multi-Currency & Historical Exchange Rate Snapshotting

### Decision
- **Base Currency**: `IDR` (Indonesian Rupiah).
- **Supported Transaction Currencies**: `IDR` and `SGD`.
- **Transaction Storage Strategy**:
  - Every financial record (`incomes.json`, `expenses.json`, `payments.json`, `prizes.json`) stores:
    - `amount` (Original transaction amount)
    - `currency` (Original currency: `"SGD"` or `"IDR"`)
    - `exchange_rate_used` (Exchange rate snapshot at entry time: e.g. `11800.00`)
    - `base_amount_idr` (Converted IDR amount: `amount * exchange_rate_used` if SGD, or `amount` if IDR)
- **Historical Immutability**:
  - Exchange rate is snapshot at the exact moment of transaction creation/update and written directly into the transaction's JSON record.
  - Updating global active exchange rates in settings NEVER recalculates past transaction records.

---

## 3. Exchange Rate Auto/Manual Sync Engine

### Decision
- **Settings Store** (`backend/data/settings.json`):
  - `exchange_rate_mode`: `"manual"` | `"auto"`
  - `exchange_rate_sgd_idr`: `"11800.00"`
  - `auto_sync_interval_hours`: `"24"`
  - `last_sync_timestamp`: `"2026-07-24T10:00:00.000Z"`
  - `last_sync_status`: `"success"` | `"fallback"`
  - `provider_name`: `"ExchangeRate-API"`
- **Backend Service** (`backend/src/services/currencyService.js`):
  - In `auto` mode, fetches latest SGD/IDR rates from public provider API (e.g. `https://api.exchangerate-api.com/v4/latest/SGD` or fallback open endpoints).
  - If external fetch fails, system logs warning and retains last valid rate (`last_sync_status: "fallback"`).
  - Admins can trigger immediate manual refresh via POST `/api/internal/admin/settings/sync-rate`.
