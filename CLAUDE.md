# CLAUDE.md

Project context for AI agents working on AG School Finance.

## Overview
AG School Finance is a lightweight web application designed to manage operational finances for AG School while maintaining a public transparency portal for event-related information.

## Core Constitution & Principles
The project is governed by the Constitution at [.rudis/memory/constitution.md](file:///c:/laragon/www/agschool/.rudis/memory/constitution.md) (Version 1.0.0).
- **Simplicity**: Avoid unnecessary complexity & dependencies.
- **Privacy-First**: Sensitive financial data, operational expenses, and member payments require mandatory authentication and authorization.
- **Controlled Transparency**: Public access is strictly limited to event information, posters, winners, and prize payment statuses.

## Target Users
- **Internal**: Administrator, Finance Team, Secretary
- **Public**: Public Visitors / Community

## Scope & Out-of-Scope
- **In Scope**: Operational income/expense tracking, member payments, event management, prize tracking, reporting, data exports, public event portal.
- **Out of Scope**: Public financial reports, public operational expense views, multi-tenant/multi-org, marketplace, chat/social features.

## How agents should work here
- Discovery-first: read and confirm understanding before changing code.
- Always check compliance with [.rudis/memory/constitution.md](file:///c:/laragon/www/agschool/.rudis/memory/constitution.md).
- Keep changes in scope; state what is OUT OF SCOPE; verify end-to-end.
- Prefer the smallest viable change; ask for approval on the diff.

