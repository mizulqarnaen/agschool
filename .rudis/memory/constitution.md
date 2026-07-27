<!--
SYNC IMPACT REPORT
Version change: 1.0.0 -> 1.1.0 (Mandated Technology Stack & JSON Storage)
Modified Principles:
  - Updated Tech Stack: React 19, Vite, Tailwind CSS, Node.js, Express.js
  - Mandatory Primary Storage: Structured JSON Files (No RDBMS/NoSQL)
  - Decoupled Structure: frontend/ (React) & backend/ (Express REST API)
Added Sections:
  - Official Technology Stack & Implementation Constraints
  - Security & File Storage Standards
  - Repository Design (Data Access Abstraction for Future RDBMS Migration)
Templates requiring updates:
  - .rudis/templates/plan-template.md: ✅ aligned
  - .rudis/templates/spec-template.md: ✅ aligned
  - .rudis/templates/tasks-template.md: ✅ aligned
Follow-up TODOs: None
-->

# AG School Finance Constitution

## Core Principles

### Principle I: Simplicity & Essential Complexity
Simplicity MUST be prioritized over unnecessary complexity. Implementations MUST focus strictly on delivering approved core functionality without adding unapproved abstractions or external dependencies.

### Principle II: Maintainable & Modular Architecture
The application MUST be separated into two independent applications: a `frontend` React SPA and a `backend` Express REST API communicating exclusively over HTTP REST. Business logic MUST be separated from presentation, using reusable UI components and a repository pattern for data access.

### Principle III: Strict Separation of Public and Internal Scopes
There MUST be an absolute boundary between authenticated internal operations and unauthenticated public portals. Public access MUST NEVER leak internal operational expenses, member payments, private financial records, or internal management views.

### Principle IV: Privacy-First Financial Protection
Confidentiality of financial data is non-negotiable. Sensitive financial information MUST be protected with mandatory JWT authentication, bcrypt password hashing, strict role-based authorization controls, and secure request validation.

### Principle V: Controlled Public Transparency
Public visitors MUST be provided transparency exclusively for event-related information (event details, posters, list of winners, prize distribution status, and prize payment status). Public visibility MUST serve community trust while maintaining zero exposure of internal operational finances.

### Principle VI: Consistent UX & Clean Reusable Code
The frontend MUST use Tailwind CSS, Lucide icons, and reusable component abstractions (Tables, Forms, Modals, Buttons, Cards, Widgets) to maintain visual excellence, dark/light aesthetics, and a cohesive user experience.

### Principle VII: Technology Stack Compliance & Business Priority
All implementations MUST follow the project owner's mandated technology stack without substitution:
- **Frontend**: React 19, Vite, JavaScript (ES6+), Tailwind CSS, React Router, Axios, Lucide React, Chart.js, React Hot Toast.
- **Backend**: Node.js (LTS), Express.js, JWT, bcrypt, Multer, REST API, Express Validator.
- **Storage**: Structured JSON Files in local filesystem (`backend/data/*.json`). NO SQLite, MySQL, PostgreSQL, MongoDB, Firebase, or Supabase allowed in current version.

### Principle VIII: Immutable Snapshot Integrity & Non-Destructive Storage
- **Data Preservation**: Existing stored records in JSON files (`backend/data/*.json`) MUST NEVER be overwritten, cleared, or lost during schema migrations or feature additions. All schema changes MUST provide default fallback values when reading legacy records.
- **Historical Snapshots**: Recorded transactions (Incomes, Expenses, Payments, Logs) store exact snapshot values (`amount`, `currency`, `exchange_rate_used`, `base_amount_idr`, `member_name`) captured at transaction time. Subsequent changes to organization settings, exchange rates, or member profiles MUST NEVER retroactively alter existing saved transaction data.

---

## Official Technology Stack & Implementation Constraints

### 1. Frontend Architecture
- **Framework**: React 19
- **Build Tool**: Vite
- **Language**: JavaScript (ES6+)
- **Styling**: Tailwind CSS
- **Routing**: React Router (v6+)
- **HTTP Client**: Axios (with centralized interceptors for JWT)
- **Icons**: Lucide React
- **Charts**: Chart.js (with react-chartjs-2)
- **Notifications**: React Hot Toast

### 2. Backend Architecture
- **Runtime**: Node.js (LTS)
- **Framework**: Express.js
- **Authentication**: JSON Web Token (JWT) & bcrypt
- **File Upload**: Multer
- **API Style**: REST API (JSON responses, standard HTTP status codes)
- **Validation**: Express Validator middleware

### 3. Primary Storage & Data Access
- **Storage Engine**: Structured JSON files located in `backend/data/` (`users.json`, `members.json`, `incomes.json`, `expenses.json`, `payments.json`, `events.json`, `prizes.json`, `logs.json`, `settings.json`).
- **Strict Prohibitions**: NO SQLite, NO MySQL, NO PostgreSQL, NO MongoDB, NO Firebase, NO Supabase.
- **Future RDBMS Compatibility**: All JSON read/write operations MUST be encapsulated behind a clean Repository / DAO (Data Access Object) layer so that future migration to relational databases can be accomplished without modifying business logic or frontend contracts.
- **File Assets**: Uploaded files (posters, payment proofs, logos) MUST be stored in the server filesystem (`backend/uploads/`). Public assets exposed via static file endpoints; private assets protected by auth middleware.

---

## Target Audiences & User Roles

### 1. Internal Users (Authenticated)
- **Administrator**: User management, governance, role assignment, system settings, audit logs.
- **Finance Team**: Operational income and expenses, internal member payments, financial reporting, data export (Excel/CSV), currency conversion.
- **Secretary**: Event management, poster uploads, prize tiers, winner lists, prize payment status tracking.

### 2. Public Visitors (Unauthenticated)
- **Public Visitors / Community**: Public event announcements, event posters, list of winners, prize payment statuses (paid/unpaid).

---

## Scope & System Boundaries

### In Scope
- Operational finance management (income & expense tracking).
- Internal member payment tracking.
- Event management & prize tracking.
- Financial reporting & data exports (for authenticated users).
- Activity logging & audit trail.
- Public event transparency portal.

### Out of Scope
- Public financial reports or public access to operational expenses/member payments.
- External database servers (MySQL, PostgreSQL, MongoDB).
- Multi-organization support / multi-tenancy.
- Marketplace or commercial e-commerce features.
- Chat, messaging, or social networking features.

---

## Strategic Long-term Goals

1. **Single Source of Truth**: Primary application for AG School operational finances.
2. **Community Transparency**: Enhance transparency for community events without compromising financial privacy.
3. **Operational Efficiency**: Streamline financial tracking through a modern React + Express interface.
4. **Database Portability**: Maintain a decoupled Data Repository architecture allowing seamless future migration from JSON files to SQL databases.

---

## Governance & Compliance

1. **Supremacy**: This Constitution supersedes all informal team practices. All specification documents (`/specs/*`), implementation plans, tasks, and pull requests MUST strictly comply with these principles and technology choices.
2. **Amendment Process**: Amendments require formal approval and documentation. Any change that alters core principles, technology stack, or governance rules MUST bump the Constitution version according to semantic versioning rules:
   - **MAJOR**: Backward-incompatible governance or principle removals/redefinitions.
   - **MINOR**: Additions of new principles, tech stack specifications, or expanded guidance.
   - **PATCH**: Non-semantic clarifications, formatting, or wording improvements.

**Version**: 1.1.0 | **Ratified**: 2026-07-24 | **Last Amended**: 2026-07-24
