# Credit Notes

CRUD-style pages for creating, reviewing, and removing customer credit notes.

## Routes

`/finance/billing/credit-notes`, `/finance/billing/credit-notes/new`, `/finance/billing/credit-notes/:id`.

## Architecture

The feature separates API services, application services, mappers, models, and standalone list/detail/form pages. API calls target `/api/credit-notes`.

## Rules

The UI validates required customer/document data and positive amounts, while the API remains the source of truth for balance limits and authorization.
