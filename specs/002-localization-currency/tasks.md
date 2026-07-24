# Tasks: Localization & Multi-Currency Management

**Input**: Design documents from `/specs/002-localization-currency/`  
**Prerequisites**: [plan.md](file:///c:/laragon/www/agschool/specs/002-localization-currency/plan.md), [spec.md](file:///c:/laragon/www/agschool/specs/002-localization-currency/spec.md), [research.md](file:///c:/laragon/www/agschool/specs/002-localization-currency/research.md), [data-model.md](file:///c:/laragon/www/agschool/specs/002-localization-currency/data-model.md), [api-spec.yaml](file:///c:/laragon/www/agschool/specs/002-localization-currency/contracts/api-spec.yaml)

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (`US1`, `US2`, `US3`)
- Exact file paths included in all descriptions.

---

## Phase 1: Setup & i18n Core Infrastructure

- [X] T001 [P] Install i18next and react-i18next in frontend/package.json
- [X] T002 [P] Create Indonesian locale dictionary in frontend/src/locales/id.json
- [X] T003 [P] Create English locale dictionary in frontend/src/locales/en.json
- [X] T004 [P] Initialize i18next configuration in frontend/src/i18n.js and import in frontend/src/main.jsx

---

## Phase 2: Foundational Backend Currency & Exchange Rate Engine

- [X] T005 [P] Extend SettingRepository in backend/src/repositories/settingRepository.js for exchange rate mode, sync intervals, and provider configuration
- [X] T006 [P] Implement CurrencyService in backend/src/services/currencyService.js for SGD/IDR rates, auto-fetching, manual overrides, and offline fallbacks
- [X] T007 Implement Exchange Rate Sync API endpoints in backend/src/controllers/adminController.js and backend/src/routes/adminRoutes.js
- [X] T008 Update transaction controllers in backend/src/controllers/financeController.js and backend/src/controllers/eventController.js to snapshot original currency, original amount, exchange rate used, and converted base amount IDR

---

## Phase 3: User Story 1 - Multi-Language Interface & Preferences (Priority: P1)

- [X] T009 [P] [US1] Build LanguageSelector component in frontend/src/components/common/LanguageSelector.jsx
- [X] T010 [US1] Integrate LanguageSelector into frontend/src/components/public/PublicNavbar.jsx and frontend/src/components/common/Sidebar.jsx
- [X] T011 [US1] Translate all Public Portal pages and Event detail components using t() hooks in frontend/src/pages/PublicPortal.jsx and frontend/src/pages/PublicEventDetail.jsx
- [X] T012 [US1] Translate all Internal Management pages, Modals, Tables, and Toast notifications

---

## Phase 4: User Story 2 & 3 - Multi-Currency Transactions & Exchange Rate Controls (Priority: P1 / P2)

- [X] T013 [P] [US2] Update Income, Expense, Payment, and Prize modals to support selecting original currency (IDR / SGD) and calculating converted base amounts
- [X] T014 [US2] Update InternalDashboard.jsx to render summary metrics in base currency (IDR) with currency display options
- [X] T015 [US2] Update ReportPage.jsx to support exporting financial datasets in original currency, base currency, or dual format
- [X] T016 [US3] Build Exchange Rate Auto/Manual Sync control panel in frontend/src/pages/SettingsPage.jsx

---

## Phase 5: Polish & Verification

- [X] T017 Execute end-to-end verification checklist per specs/002-localization-currency/quickstart.md
