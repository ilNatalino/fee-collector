# Implementation Tickets

This file breaks the refactor PRD into sequenced implementation tickets.

Use the domain language from [CONTEXT.md](./CONTEXT.md) when implementing these tickets. The order below is the recommended execution order because later tickets assume the seams and invariants introduced by earlier ones.

## Ticket 01 - Normalize the Group Domain Model

**Goal**

Introduce one coherent domain model for `Group`, `Member`, `Membership`, `Quota`, and `Payment` that matches the glossary and stops mixing person identity with group-local participation.

**Scope**

- Introduce explicit `Member`, `Membership`, and `Payment` domain shapes.
- Move money values to cent precision in the domain model.
- Remove `hasPaid` and `amountPaid` as primary stored truths in favor of deriving current paid amount from current Payments.
- Update mock domain data so it can express the current app state through the new model.

**Acceptance Criteria**

- The domain model can represent a `Group` with one or more `Memberships`.
- Each `Membership` refers to exactly one `Member`.
- Each `Payment` belongs to exactly one `Membership`.
- Money-bearing domain values are cent-precise.
- The model no longer treats `hasPaid` or `amountPaid` as authoritative state.

**Dependencies**

- None.

**Tests**

- Add behavior-focused tests for cent-precision parsing or conversion helpers.
- Add fixtures that demonstrate the new domain shapes without relying on UI components.

## Ticket 02 - Consolidate Current Payments into the Group Write Model

**Goal**

Create one shared current `Payment` source inside the `Group` write model and remove duplicate payment-like state ownership.

**Scope**

- Move authoritative current `Payments` under each `Membership` in the `Group` write model.
- Stop maintaining a separate current activity or payment list in parallel.
- Ensure all payment consumers can be fed from the shared source, even if temporary adapters are needed during migration.

**Acceptance Criteria**

- There is exactly one authoritative current `Payment` source.
- The current `Payment` source lives inside the `Group` write model.
- The app no longer requires a separate payment-like store to render current payment information.

**Dependencies**

- Ticket 01.

**Tests**

- Add tests proving that reads from different consumers reflect the same current `Payments`.
- Add tests showing that deleting or editing a `Payment` changes the shared current state rather than one screen-local copy.

## Ticket 03 - Replace Split Mutations with Domain Commands

**Goal**

Expose domain-action commands from the `Group` write model and remove generic or duplicated mutation paths.

**Scope**

- Replace primitive mutation APIs with domain commands such as `create group`, `record payment`, `edit payment`, `delete payment`, and any allowed pre-collection membership command.
- Remove `toggleMemberPaid` as a domain concept and treat it only as UI shorthand for creating one `Payment` equal to the `Remaining Amount`.
- Remove activity-log-owned writes.

**Acceptance Criteria**

- Only the `Group` write model owns `Payment` create, edit, and delete commands.
- The command surface uses domain language rather than raw CRUD setters.
- The mark-paid shortcut records a `Payment` for the current `Remaining Amount`.

**Dependencies**

- Ticket 02.

**Tests**

- Add command-level tests for `record payment`, `edit payment`, and `delete payment`.
- Verify that edits stay on the same `Membership`, preserve recorded date, preserve recorded labels, and respect the `Quota` cap.

## Ticket 04 - Build the Current-State Projection Module

**Goal**

Extract a pure, read-only module that projects current `Group` state into stable named interfaces.

**Scope**

- Build `Group Projection`.
- Build `Member Quota Projection`.
- Build `Group Collection Projection`.
- Encode `Group Status`, `Group Progress`, `Due State`, `Collected Amount`, `Remaining Amount`, and `Quota Breakdown` in one place.
- Represent invalid input in the return type rather than throwing.

**Acceptance Criteria**

- Current-state projection logic lives in one pure module.
- Projections are returned through named interfaces rather than anonymous helper objects.
- Projection outputs use raw semantic values, not formatted UI strings.
- Invalid input is visible at the interface boundary.

**Dependencies**

- Ticket 01.
- Ticket 02.

**Tests**

- Add pure-module tests for `Group Status`, `Group Progress`, `Due State`, `Quota Breakdown`, `Collected Amount`, and `Remaining Amount`.
- Cover reopening a completed `Group` after a `Payment` correction.
- Cover invalid `Group` and invalid collection projection behavior.

## Ticket 05 - Build the Activity Log Module

**Goal**

Extract a separate read-only module that projects current `Payments` into chronological `Activity Log` views.

**Scope**

- Build `Payment Projection` for the `Activity Log`.
- Project current `Payments` into chronological listing order.
- Preserve recorded `Member` and `Group` names and original recorded date in the read model.
- Keep the `Activity Log` separate from current-state group projections.

**Acceptance Criteria**

- The `Activity Log` module is read-only.
- `Payment Projection` exposes both stable identities and recorded labels.
- The `Activity Log` reflects the current state of `Payments`, not a duplicate store.

**Dependencies**

- Ticket 02.
- Ticket 03.

**Tests**

- Add pure-module tests for chronological ordering.
- Add tests proving that `Payment` edits keep original recorded dates and immutable recorded labels.
- Add tests proving that deleted `Payments` disappear from the current `Activity Log`.

## Ticket 06 - Add Concept-Scoped Adapter Hooks

**Goal**

Expose the new seams to the UI through concept-scoped hooks rather than raw aggregates or screen-specific orchestration.

**Scope**

- Add hooks for `Group Collection Projection`, `Group Projection` by id, `Member Quota Projections`, `Activity Log Projection`, and `Group` commands.
- Keep hooks thin adapters over the write model and the two read-only projection modules.
- Stop exposing raw `Group` aggregates directly to route files.

**Acceptance Criteria**

- Routes can consume projections plus commands without reading raw aggregates.
- Hooks are concept-scoped rather than screen-specific.
- The adapter layer does not duplicate projection logic.

**Dependencies**

- Ticket 03.
- Ticket 04.
- Ticket 05.

**Tests**

- Add public-boundary tests for adapter hooks where appropriate.
- Verify that hooks expose projections and commands, not implementation details.

## Ticket 07 - Migrate Dashboard and Group Detail to Projections

**Goal**

Move current-state screens off raw provider reads and onto `Group Projection` and `Member Quota Projection`.

**Scope**

- Migrate the dashboard route to `Group Collection Projection` and current `Group Projection` reads.
- Migrate the Group detail route to `Group Projection`, `Member Quota Projections`, and command hooks.
- Remove route-local business logic for progress, collection totals, due state, and member payment classification.

**Acceptance Criteria**

- Dashboard rendering depends on projections rather than local reductions.
- Group detail rendering depends on projections rather than raw aggregate math.
- No current-state UI derives `Quota Status`, `Group Progress`, or `Quota Breakdown` inline.

**Dependencies**

- Ticket 06.

**Tests**

- Add route-level behavior tests if practical, focused on rendered projection outcomes rather than internal hook details.
- Add regression coverage for completed-to-collecting reopening behavior in the UI.

## Ticket 08 - Migrate the Payments Screen and Retire Duplicate Activity State

**Goal**

Move the payments screen onto the shared `Payment` source and remove the duplicate activity provider behavior.

**Scope**

- Migrate the payments screen to the `Activity Log` module and command hooks.
- Remove screen-specific payment writes from any separate activity owner.
- Retire or delete the duplicate current activity state once the screen is migrated.

**Acceptance Criteria**

- The payments screen reads from the same current `Payment` source as current-state projections.
- Editing or deleting a `Payment` in the payments screen updates live `Quota Status`, `Group Progress`, `Collected Amount`, `Remaining Amount`, and `Quota Breakdown`.
- No duplicate payment-like state remains.

**Dependencies**

- Ticket 05.
- Ticket 06.

**Tests**

- Add integration-oriented tests that prove the payments screen and group summaries stay in sync after edits or deletes.

## Ticket 09 - Tighten Group Creation and Payment Validation

**Goal**

Make the write flows enforce the fixed-target and current-payment invariants defined in the glossary.

**Scope**

- Enforce that a `Group` cannot be created without at least one `Membership`.
- Enforce that initial `Quotas` sum exactly to the fixed `Group Target`.
- Enforce exact full-name deduplication for inline `Member` creation.
- Enforce canonical optional `Group Category` values.
- Enforce strictly positive, cent-precise, capped `Payments` for both create and edit flows.

**Acceptance Criteria**

- Invalid creation-time `Group` states are blocked by the write flow.
- Invalid `Payment` edits are blocked by the write flow.
- The optional category vocabulary is consistent.
- The UI no longer permits creation flows that intentionally violate the glossary.

**Dependencies**

- Ticket 03.
- Ticket 06.

**Tests**

- Add validation-focused tests around target sum, roster minimum, payment positivity, payment cap, and member deduplication.

## Ticket 10 - Remove Obsolete Shapes and Harden the Refactor

**Goal**

Delete superseded shapes, helper logic, and providers once the new seams are in use everywhere.

**Scope**

- Remove obsolete payment-like or activity-like state owners.
- Remove dead helper logic that duplicates projections.
- Remove old raw aggregate reads no longer used by the UI.
- Refresh any high-level documentation that still describes the old architecture.

**Acceptance Criteria**

- The codebase has one `Group` write model, one current-state projection module, and one `Activity Log` module.
- The UI consumes projections plus commands only.
- Dead state, dead helper logic, and duplicate write paths are removed.

**Dependencies**

- Tickets 01 through 09.

**Tests**

- Run the full relevant test suite added during the refactor.
- Add cleanup regression coverage where old and new paths could otherwise coexist unnoticed.

## Recommended Execution Notes

- Ticket 02 is the highest-leverage first implementation slice because it removes the duplicate current `Payment` source of truth.
- Ticket 04 and Ticket 05 should stay pure and test-first where practical, because they are the deepest modules in the refactor.
- Ticket 07 and Ticket 08 should not introduce new projection logic in routes. If a route needs more data, extend the projection module or adapter hook instead.
- Ticket 09 should be done after the new command seam exists, so validation is enforced where writes actually happen.