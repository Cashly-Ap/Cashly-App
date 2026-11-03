# Payment Methods

Maintains the methods selectable by payment and cash-register workflows.

## Routes

`/finance/treasury/payment-methods`, `/finance/treasury/payment-methods/new`, `/finance/treasury/payment-methods/:id`, and `/finance/treasury/payment-methods/:id/edit`.

## API

The feature uses `/api/payment-methods` for list, detail, create, update, toggle, and delete operations.

## Rules

Inactive methods remain visible for historical data but should not be offered for new transactions. Form validation handles required names and active state.
