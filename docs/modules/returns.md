# Returns

Customer return workflow for reviewing returned items and their stock/financial effect.

## Routes

`/finance/billing/returns`, `/finance/billing/returns/new`, `/finance/billing/returns/:id`.

Legacy `/returns` redirects to `/finance/billing/returns`.

## Architecture

Returns live in `src/app/features/finance/billing/returns/` with standalone list, form, and details pages plus dialogs, API/application services, models, and permissions.

## Rules

The UI validates the source document and returned quantities; the API enforces eligible quantities and applies stock changes atomically. Returns update the source invoice's `returnedQuantity`, `returnedTotal`, and `returnStatus`.
