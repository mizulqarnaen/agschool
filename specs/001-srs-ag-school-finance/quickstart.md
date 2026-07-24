# Quickstart & Local Setup Guide: AG School Finance (React + Node.js)

**Feature**: `001-srs-ag-school-finance`  
**Date**: 2026-07-24  

## Overview

This guide explains how to initialize, run, and verify AG School Finance locally with a decoupled **React 19 (Vite)** frontend and **Node.js (Express)** backend utilizing **JSON File Storage**.

---

## 1. Prerequisites

- Node.js (LTS v18+ or v20+) & npm.
- Web Browser (Chrome, Firefox, Edge, Safari).

---

## 2. Directory Structure Setup

The repository is divided into two independent subdirectories:
```text
c:/laragon/www/agschool/
├── backend/       # Express.js REST API & JSON file storage
└── frontend/      # React 19 + Vite + Tailwind CSS SPA
```

---

## 3. Launch Instructions

### Step 1: Start Backend Express REST API Server
```bash
cd c:/laragon/www/agschool/backend
npm install
npm run dev
```
The Express REST API server will run on `http://localhost:5000`.

### Step 2: Start Frontend React Vite App
In a separate terminal:
```bash
cd c:/laragon/www/agschool/frontend
npm install
npm run dev
```
The React 19 application will open on `http://localhost:5173`.

---

## 4. Initial Seed Data & Default Admin Credentials

The backend automatically creates default JSON files in `backend/data/` if they do not exist:
- **Default Admin Username**: `admin`
- **Default Admin Password**: `Password123!`

---

## 5. Verification Checklist

1. **Public Transparency Portal Verification**:
   - Open `http://localhost:5173/` in a browser (unauthenticated).
   - Verify public event list, event detail pages, posters, winner lists, and prize payment statuses (`Paid` / `Unpaid`) render correctly.
   - Verify zero exposure of internal financial numbers or member payment details.

2. **Internal Management Portal Verification**:
   - Click "Login" or navigate to `http://localhost:5173/login`.
   - Log in with `admin` / `Password123!`.
   - Test Income, Operational Expense, and Internal Member Payment forms.
   - Confirm Net Balance, Chart.js widgets, and totals update immediately.
   - Export reports to CSV and Excel (`.xlsx`).

3. **JSON Storage & Audit Verification**:
   - Check `backend/data/incomes.json`, `backend/data/expenses.json`, `backend/data/payments.json`, and `backend/data/logs.json` to verify atomic JSON formatting and logging.
