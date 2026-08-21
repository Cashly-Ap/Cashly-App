# Returns

Customer return workflow for reviewing returned items and their stock/financial effect.

## Routes

The feature is reached from customer/invoice workflows and uses its standalone return forms and dialogs rather than a top-level CRUD route.

## Rules

The UI validates required source document and quantities; the API enforces eligible quantities and applies stock changes atomically.
