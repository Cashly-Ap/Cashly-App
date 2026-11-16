# Payments (reporting)

## Overview

The `finance/treasury/payments` feature only implements payment reporting. Payment registration and approval live in [receivables.md](./receivables.md); payment methods live in [payment-methods.md](./payment-methods.md).

**Module Type**: `Read-only` (reporting only)

---

## Module Structure

```
src/app/features/finance/treasury/payments/
├── i18n/                     # Translations
└── reporting/
    ├── models/               # Payment report filter interfaces
    └── services/api/         # PaymentPdfApiService
```

---

## API

`PaymentPdfApiService` calls the payment report endpoints and returns PDF content. Receivables owns the approval-specific workflow and its own PDF service.

---

## Rules

- There are no list, form, or detail routes for payments.
- Report actions are permission-checked by the owning finance module.
- Receipt and approval state remain owned by the API.

---

## Related Documentation

- [Receivables](./receivables.md)
- [Payment Methods](./payment-methods.md)
- [Reporting](./reports.md)
