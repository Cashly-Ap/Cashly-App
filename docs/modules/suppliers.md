# Suppliers

Supplier CRUD and selection support for purchasing.

## Routes

`/suppliers`, `/suppliers/new`, `/suppliers/:id`, and `/suppliers/:id/edit`.

## API

The feature calls `/api/suppliers` through its API/application services and paged list models.

## Rules

Required identity and tax/contact fields are validated in forms; deletion remains subject to API business constraints.
