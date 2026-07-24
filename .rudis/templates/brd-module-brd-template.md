# Module BRD: [MODULE NAME]

**Back to**: [00-overview.md](../../00-overview.md)
**Last Updated**: [DATE]

## Module Summary

<!--
  ACTION REQUIRED: 1-3 sentences on what this module does and why it exists,
  in business language.
-->

[What this module does, in business language.]

## Capabilities

<!--
  ACTION REQUIRED: Describe each capability as a business-facing requirement
  (what the system does), not an implementation detail (no framework/library/
  schema names here). ID prefix must match this module (e.g. AUTH-CAP-001)
  so it stays unique and citable from 00-overview.md.
-->

- **[MODULE]-CAP-001**: System supports [capability, e.g. "users creating an account with email verification"]
- **[MODULE]-CAP-002**: System supports [capability]

*Example of marking unclear scope:*

- **[MODULE]-CAP-003**: System supports [capability] for [NEEDS CLARIFICATION: which user segment - all users or a specific plan tier?]

## Key Business Entities & Rules

<!--
  ACTION REQUIRED: From data models/migrations/schema owned by this module -
  described as business objects and rules, not as database tables/columns.
  ID prefix must match this module (e.g. AUTH-ENT-001).
-->

- **[MODULE]-ENT-001 [Entity 1]**: [What it represents in the business, key attributes, notable rules/constraints]
- **[MODULE]-ENT-002 [Entity 2]**: [What it represents, relationships to other entities - note if the relationship crosses into another module]

## Business Actors

<!--
  OPTIONAL - only include an actor here if their interaction with this module
  isn't already fully covered by the system-wide table in 00-overview.md.
  Omit this section entirely if every actor touching this module is already
  covered there.
-->

| Actor | Interaction in this module |
| ----- | --------------------------- |
| [Actor] | [What they do here specifically] |

## Screens / Pages

<!--
  OPTIONAL - only include this section if this module has a user-facing UI
  (pages/routes/components), found via a routing config or page directory.
  Omit entirely for backend-only/headless modules. Exists so a UI revamp can
  be scoped and checked off screen by screen (e.g. via /rudis.redesign),
  instead of guessing at what pages exist from the flow diagrams alone.
-->

| Screen | Route/Path | Purpose | Related Capabilities | Entry File |
| ------ | ---------- | ------- | --------------------- | ---------- |
| [Screen name] | [e.g. `/orders/:id`] | [What the user does here] | [MODULE]-CAP-001 | [`path/to/Page.ext`](path/to/Page.ext) |

## Constraints

<!--
  ACTION REQUIRED: Observed constraints specific to this module, not
  aspirational ones. System-wide constraints belong in 00-overview.md instead.
-->

- [Constraint or characteristic observed in the code, scoped to this module]

## Out of Scope / Known Gaps

<!--
  ACTION REQUIRED: Things referenced (docs, TODOs, stubbed code) but not
  implemented within this module, or explicitly deferred.
-->

- [Referenced-but-missing capability, or deliberately deferred item]

## Change Log

<!--
  Maintained by /rudis.brd on each re-run that touches this module.
  Prepend newest entry first. Independent from other modules' update cadence.
-->

- **[DATE]**: Initial version generated from codebase survey.
