# Price Types

CRUD pages for price categories assigned to product prices.

## Routes

`/price-types`, `/price-types/new`, `/price-types/:id`, and `/price-types/:id/edit`.

## API

Calls target `/api/price-types`; list pagination and active-state editing are handled by the application service.

## Rules

Names are required and active state controls availability for new assignments. Existing prices keep their historical type.
