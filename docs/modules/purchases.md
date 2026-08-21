# Purchases

Supplier purchase workflow with draft, confirmation, cancellation, and stock effects.

## Routes

`/purchases`, `/purchases/new`, `/purchases/:id`, and `/purchases/:id/edit`.

## Rules

Drafts can be edited; confirmation applies inventory and locks the business document. The UI delegates final state and stock validation to the API.
