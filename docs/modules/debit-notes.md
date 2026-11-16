# Debit Notes

Pages for creating and reviewing additional customer charges.

## Routes

`/sales/debit-notes`, `/sales/debit-notes/new`, `/sales/debit-notes/:id`.

## Architecture

Debit notes live in `src/app/features/sales/invoices/debit-notes/`. Standalone list, detail, and form pages use the debit-notes API/application services and map DTOs into view models. The API base is `/api/debit-notes`.

## Rules

Required customer/reason data and positive amounts are validated before submit; balance rules are enforced by the API.
