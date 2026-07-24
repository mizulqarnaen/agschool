# Tasks: AG School Finance

**Input**: Design documents from `/specs/001-srs-ag-school-finance/`  
**Prerequisites**: [plan.md](file:///c:/laragon/www/agschool/specs/001-srs-ag-school-finance/plan.md), [spec.md](file:///c:/laragon/www/agschool/specs/001-srs-ag-school-finance/spec.md), [research.md](file:///c:/laragon/www/agschool/specs/001-srs-ag-school-finance/research.md), [data-model.md](file:///c:/laragon/www/agschool/specs/001-srs-ag-school-finance/data-model.md), [api-spec.yaml](file:///c:/laragon/www/agschool/specs/001-srs-ag-school-finance/contracts/api-spec.yaml)

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (`US1`, `US2`, `US3`, `US4`)
- Exact file paths included in all descriptions.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Decoupled repository initialization (`frontend/` React SPA and `backend/` Express REST API).

- [X] T001 Create directory structure for backend/ and frontend/ per implementation plan
- [X] T002 Initialize Node.js Express backend dependencies in backend/package.json
- [X] T003 [P] Initialize React 19 Vite frontend dependencies in frontend/package.json
- [X] T004 [P] Configure Tailwind CSS design tokens and base styles in frontend/src/index.css and frontend/vite.config.js

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core JSON storage repositories, JWT authentication, RBAC middleware, and API client.

**⚠️ CRITICAL**: Must complete before user stories can begin.

- [X] T005 Implement JsonRepository base class for atomic file read/write operations in backend/src/repositories/baseRepository.js
- [X] T006 [P] Implement LoggerService for structured activity audit logging in backend/src/services/loggerService.js
- [X] T007 [P] Implement JWT Authentication Middleware and bcrypt password helpers in backend/src/middleware/authMiddleware.js
- [X] T008 [P] Implement Role-Based Access Control Middleware in backend/src/middleware/roleMiddleware.js
- [X] T009 Setup Express server entry point, CORS, static uploads serving, and centralized error handler in backend/server.js
- [X] T010 [P] Implement database seeding script for initial JSON data in backend/scripts/seed.js
- [X] T011 [P] Setup Axios HTTP API service with JWT authorization header interceptors in frontend/src/services/api.js
- [X] T012 [P] Implement AuthContext provider and ProtectedRoute wrapper component in frontend/src/context/AuthContext.jsx

**Checkpoint**: Foundation ready - user story implementation can begin.

---

## Phase 3: User Story 1 - Public Visitor Views Event Transparency (Priority: P1) 🎯 MVP

**Goal**: Enable unauthenticated public visitors to browse community events, view promotional posters, inspect winner rosters, and check prize payment statuses without accessing private finances.

**Independent Test**: Access `http://localhost:5173/` without logging in, verify event posters, winners, and prize payment statuses (`Paid`/`Unpaid`), and confirm internal financial URLs redirect to login.

- [X] T013 [P] [US1] Implement EventRepository and PrizeRepository read queries in backend/src/repositories/eventRepository.js and backend/src/repositories/prizeRepository.js
- [X] T014 [US1] Implement Public Portal Controller and routes (GET /api/public/events) in backend/src/controllers/publicController.js and backend/src/routes/publicRoutes.js
- [X] T015 [P] [US1] Build Public Header/Navbar and Footer components in frontend/src/components/public/PublicNavbar.jsx and frontend/src/components/public/PublicFooter.jsx
- [X] T016 [P] [US1] Build Public Event Card & Poster preview component in frontend/src/components/public/EventCard.jsx
- [X] T017 [US1] Build Public Transparency Portal main page in frontend/src/pages/PublicPortal.jsx
- [X] T018 [US1] Build Public Event Detail page with Winner list & Prize payment status badges in frontend/src/pages/PublicEventDetail.jsx

**Checkpoint**: User Story 1 MVP fully functional and independently testable.

---

## Phase 4: User Story 2 - Finance Team Records Income & Operational Expenses (Priority: P1)

**Goal**: Allow Finance Team members to manage operational income, expenses, internal member payments (BA, Caster, Maintainer, Secretary), generate dashboard metrics, and export reports.

**Independent Test**: Log in as a Finance user, record income/expense/payment entries, verify Net Balance updates on dashboard widgets, and export CSV/Excel reports.

- [X] T019 [P] [US2] Implement IncomeRepository, ExpenseRepository, and PaymentRepository in backend/src/repositories/incomeRepository.js, backend/src/repositories/expenseRepository.js, backend/src/repositories/paymentRepository.js
- [X] T020 [P] [US2] Implement Express Validator schemas for financial transaction payloads in backend/src/middleware/validationMiddleware.js
- [X] T021 [US2] Implement Finance Controllers and REST routes (/api/internal/incomes, /api/internal/expenses, /api/internal/payments) in backend/src/controllers/financeController.js and backend/src/routes/financeRoutes.js
- [X] T022 [P] [US2] Implement Report Exporter Service for CSV and Excel formats in backend/src/services/exportService.js
- [X] T023 [P] [US2] Build reusable Data Table, Modal, and Currency Formatter components in frontend/src/components/common/Table.jsx and frontend/src/components/common/Modal.jsx
- [X] T024 [US2] Build Internal Dashboard with Chart.js financial summary widgets in frontend/src/pages/InternalDashboard.jsx
- [X] T025 [US2] Build Income Management page with creation/search/filter modal in frontend/src/pages/IncomePage.jsx
- [X] T026 [US2] Build Operational Expense Management page with event linking in frontend/src/pages/ExpensePage.jsx
- [X] T027 [US2] Build Internal Member Payment Management page for staff payouts in frontend/src/pages/PaymentPage.jsx
- [X] T028 [US2] Build Financial Report & CSV/Excel Export page in frontend/src/pages/ReportPage.jsx

**Checkpoint**: User Stories 1 AND 2 functional independently.

---

## Phase 5: User Story 3 - Secretary Manages Event & Prize Distribution (Priority: P2)

**Goal**: Enable Secretaries to create events, upload poster images via Multer, define prize tiers, record winners, and update prize payment statuses.

**Independent Test**: Log in as Secretary, create an event, upload poster image, record winner, mark prize status as "Paid", and verify update on Public Portal.

- [X] T029 [P] [US3] Configure Multer file upload middleware for event poster images in backend/src/middleware/uploadMiddleware.js
- [X] T030 [US3] Implement Event & Prize management controllers and REST routes in backend/src/controllers/eventController.js and backend/src/routes/eventRoutes.js
- [X] T031 [P] [US3] Build Event Form Modal with Poster File Upload component in frontend/src/components/events/EventFormModal.jsx
- [X] T032 [US3] Build Internal Event Management page with status toggles in frontend/src/pages/EventManagementPage.jsx
- [X] T033 [US3] Build Prize Tier & Winner Management Modal with payment status controls in frontend/src/components/events/PrizeModal.jsx

**Checkpoint**: User Stories 1, 2, and 3 functional.

---

## Phase 6: User Story 4 - Administrator Manages Users, Roles & System Settings (Priority: P2)

**Goal**: Enable Administrators to manage user accounts, assign roles, configure SGD/IDR exchange rates, and inspect system audit logs.

**Independent Test**: Log in as Admin, create user account, update SGD/IDR exchange rate, inspect Activity Log, deactivate user account, and test session termination.

- [X] T034 [P] [US4] Implement UserRepository, RoleRepository, and SettingRepository in backend/src/repositories/userRepository.js and backend/src/repositories/settingRepository.js
- [X] T035 [US4] Implement Admin User & System Settings Controllers and routes in backend/src/controllers/adminController.js and backend/src/routes/adminRoutes.js
- [X] T036 [P] [US4] Build User Account Management page (Create/Edit/Deactivate) in frontend/src/pages/UserManagementPage.jsx
- [X] T037 [P] [US4] Build System Settings & Currency Converter Configuration page in frontend/src/pages/SettingsPage.jsx
- [X] T038 [US4] Build Activity Log Viewer page with search and module filtering in frontend/src/pages/ActivityLogPage.jsx

**Checkpoint**: All user stories fully functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Application hardening, notifications, responsive layouts, and end-to-end verification.

- [X] T039 [P] Integrate React Hot Toast notifications across all frontend forms in frontend/src/services/toast.js
- [X] T040 [P] Implement global 404 & Access Denied pages in frontend/src/pages/NotFoundPage.jsx and frontend/src/pages/UnauthorizedPage.jsx
- [X] T041 Add responsive drawer navigation for mobile viewports in frontend/src/components/common/Sidebar.jsx
- [X] T042 Run full quickstart.md end-to-end validation checklist
