# Purchases

Supplier purchase workflow with draft, confirmation, cancellation, and stock effects.

## Routes

`/procurement/purchases`, `/procurement/purchases/new`, `/procurement/purchases/:id`, and `/procurement/purchases/:id/edit`.

## Rules

Drafts can be edited; confirmation applies inventory and locks the business document. The UI delegates final state and stock validation to the API.
