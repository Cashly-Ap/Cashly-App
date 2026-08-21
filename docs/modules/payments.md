# Payments

Payment administration and payment detail views for finance users.

## Routes

`/payments`, `/payments/new`, `/payments/:id`, and `/payments/:id/edit`.

## API

The feature uses `/api/payments` for list, detail, create, update, and delete operations. Receivables owns the approval-specific workflow.

## Rules

Payment amounts and references are validated in the form; invoice/customer balance, allocation, and approval state are enforced by the API.
