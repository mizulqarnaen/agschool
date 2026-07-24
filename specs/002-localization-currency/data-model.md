# Data Model & Schema Design: Localization & Multi-Currency Management

**Feature**: `002-localization-currency`  
**Date**: 2026-07-24  

## Overview

This document specifies the updated JSON file schemas for storing language preferences, multi-currency transaction snapshots, and exchange rate auto/manual sync configurations.

---

## Entity Schema Updates

### 1. `backend/data/settings.json` (Extended)
```json
[
  { "setting_key": "org_name", "setting_value": "AG School" },
  { "setting_key": "contact_email", "setting_value": "contact@agschool.com" },
  { "setting_key": "default_language", "setting_value": "id" },
  { "setting_key": "default_currency", "setting_value": "IDR" },
  { "setting_key": "exchange_rate_mode", "setting_value": "manual" },
  { "setting_key": "exchange_rate_sgd_idr", "setting_value": "11800.00" },
  { "setting_key": "auto_sync_interval_hours", "setting_value": "24" },
  { "setting_key": "last_sync_timestamp", "setting_value": "2026-07-24T10:00:00.000Z" },
  { "setting_key": "last_sync_status", "setting_value": "success" },
  { "setting_key": "provider_name", "setting_value": "ExchangeRate-API" }
]
```

### 2. Financial Transaction Records (`incomes.json`, `expenses.json`, `payments.json`)
```json
[
  {
    "id": 1,
    "transaction_date": "2026-07-20",
    "category": "Sponsorship",
    "source": "Global Tech Corp",
    "description": "Title Sponsorship",
    "amount": 100.00,
    "currency": "SGD",
    "exchange_rate_used": 11800.00,
    "base_amount_idr": 1180000.00,
    "notes": "Sponsorship payment received",
    "recorded_by_user_id": 1,
    "created_at": "2026-07-20T10:00:00.000Z",
    "updated_at": "2026-07-20T10:00:00.000Z",
    "deleted_at": null
  }
]
```

### 3. User Language Preference (`users.json` Extended)
```json
{
  "id": 1,
  "username": "admin",
  "preferred_language": "id"
}
```
