# Returns

Customer return workflow for reviewing returned items and their stock/financial effect.

## Routes

`/sales/returns`, `/sales/returns/new`, `/sales/returns/:id`.

Legacy `/returns` redirects to `/sales/returns`.

## Architecture

Returns live in `src/app/features/sales/invoices/returns/` with standalone list, form, and details pages plus dialogs, API/application services, models, and permissions.

## Rules

The UI validates the source document and returned quantities; the API enforces eligible quantities and applies stock changes atomically. Returns update the source invoice's `returnedQuantity`, `returnedTotal`, and `returnStatus`.
