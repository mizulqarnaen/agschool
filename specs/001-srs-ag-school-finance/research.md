# Research & Architecture Decisions: AG School Finance

**Feature**: `001-srs-ag-school-finance`  
**Date**: 2026-07-24  

## Overview

This research document analyzes technical decisions, architectural patterns, and technology stack choices for AG School Finance based on the updated project Constitution (v1.1.0) and mandated tech stack constraints.

---

## 1. Stack Selection & Architecture

### Decision
- **Architecture Type**: Decoupled Two-Tier Architecture (`frontend/` SPA + `backend/` REST API).
- **Frontend Stack**:
  - Framework: React 19
  - Build Tool: Vite
  - Language: JavaScript (ES6+)
  - Styling: Tailwind CSS
  - Routing: React Router v6+
  - HTTP Client: Axios (with request/response interceptors for JWT header management)
  - Components/Icons/UI: Lucide React, Chart.js (react-chartjs-2), React Hot Toast
- **Backend Stack**:
  - Runtime: Node.js (LTS)
  - Framework: Express.js
  - Authentication: JWT (jsonwebtoken) & bcrypt for password hashing
  - File Uploads: Multer middleware
  - Validation: Express Validator
- **Storage Engine**:
  - Primary Storage: Structured JSON Files stored in `backend/data/` (`users.json`, `members.json`, `incomes.json`, `expenses.json`, `payments.json`, `events.json`, `prizes.json`, `logs.json`, `settings.json`).
  - File Storage: Server filesystem `backend/uploads/` (posters, payment proofs, logos).

### Rationale
1. **Mandated Tech Stack**: Strictly fulfills all user/project owner technology directives.
2. **Decoupled Architecture**: `frontend/` and `backend/` run as independent processes. Frontend interacts exclusively via REST API calls.
3. **Repository Pattern for JSON Storage**: Encapsulates file reading, atomic JSON writing, concurrency locking, and filtering inside data access repositories (`UserRepository`, `IncomeRepository`, `EventRepository`, etc.). This ensures that future migration to relational databases (e.g. PostgreSQL or MySQL) can be performed seamlessly by swapping repository implementations without altering controllers or React frontend code.

---

## 2. Security & File Storage Strategy

### Decision
- **Authentication**: JWT token issued upon POST `/api/auth/login`. Frontend stores token in memory/localStorage and attaches `Authorization: Bearer <token>` header via Axios interceptors.
- **Authorization**: Express middleware checks user role (`Administrator`, `Finance`, `Secretary`) extracted from JWT payload for protected `/api/internal/*` routes.
- **File Uploads & Access Control**:
  - Uploads processed via `multer` into `backend/uploads/posters/` and `backend/uploads/proofs/`.
  - Public assets (event posters) served statically via `/uploads/posters`.
  - Private assets (payment proofs, private docs) served via authenticated Express routes enforcing permission checks.

---

## 3. JSON Storage & Concurrency Handling

### Decision
- Atomic file writes using temporary files (`fs.writeFileSync` to `.tmp` then atomic rename via `fs.renameSync` or `steno`/`lockfile`) to prevent corrupted JSON files on concurrent writes.
- Helper class `JsonRepository<T>` providing standardized CRUD, auto-increment IDs, timestamping, soft-deletion filtering, and pagination.
