# Price Types

CRUD pages for price categories assigned to product prices.

## Routes

`/catalog/price-types`, `/catalog/price-types/new`, `/catalog/price-types/:id`, and `/catalog/price-types/:id/edit`.

## API

Calls target `/api/price-types`; list pagination and active-state editing are handled by the application service.

## Rules

Names are required and active state controls availability for new assignments. Existing prices keep their historical type.
