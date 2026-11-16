# Expenses

Expense ledger entries linked to a cash register session. Expenses can be registered against an open or a closed register, carry an explicit occurrence date, and follow different lifecycle rules depending on the register status.

## Routes

- `/finance/treasury/expenses`: expense list with filters, status and actions.
- `/finance/treasury/expenses/new`: create an expense.
- `/finance/treasury/expenses/:id`: expense details.

## API

Expenses are cash register movements of type `EXPENSE` and direction `OUT`.

### Create

`POST /api/cash-register/{registerId}/movements`

```json
{
  "direction": "OUT",
  "type": "EXPENSE",
  "amount": 25.5,
  "paymentMethodId": "uuid",
  "description": "Transporte",
  "occurredAt": "2026-11-09T14:30:00"
}
```

- `registerId` may reference an open or a closed register.
- `occurredAt` is optional ISO local date-time without timezone (`yyyy-MM-ddTHH:mm:ss`); the backend defaults to `now()`.
- When the register is closed, the backend recalculates its totals, expected balance and difference against the original declared balance.

### Delete

`DELETE /api/cash-register/movements/{movementId}`

- Only allowed while the register that owns the movement is `OPEN`.
- Only manually registered expenses (`sourceType = MANUAL`) can be deleted.
- Returns `204 No Content`. A closed register, an already cancelled expense or a non-manual movement returns `409`.

### Cancel

`POST /api/cash-register/movements/{movementId}/cancel`

```json
{ "reason": "Gasto registrado por error en una caja cerrada" }
```

- Only allowed when the register that owns the movement is `CLOSED`.
- Cancellation keeps the movement in history and removes it from the register totals.
- `reason` is required and limited to 500 characters.
- Returns the updated `CashMovementResponse` with `cancelled = true`.

### Read

The list is derived from `GET /api/cash-register/history?detailed=true`, flattening `EXPENSE` / `OUT` movements. Each movement exposes its register status through the parent session.

Register options for the form come from `GET /api/cash-register/history?detailed=false&size=100&sort=openedAt,desc` and include both open and closed sessions.

## Interfaces

```typescript
export type ExpenseRegisterStatus = 'OPEN' | 'CLOSED';

export interface Expense {
  id: string;
  registerId: string;
  registerOpenedAt: string;
  registerStatus: ExpenseRegisterStatus;
  amount: number;
  description: string;
  paymentMethodId: string | null;
  paymentMethodName: string;
  createdByName: string | null;
  occurredAt: string;
  cancelled: boolean;
  cancellationReason: string | null;
  cancelledAt: string | null;
  cancelledBy: string | null;
  cancelledByName: string | null;
}

export interface ExpenseCreate {
  registerId: string;
  amount: number;
  description: string;
  paymentMethodId: string;
  occurredAt: string;
}

export interface ExpenseRegisterOption {
  id: string;
  openedAt: string;
  closedAt: string | null;
  status: ExpenseRegisterStatus;
  openedByName: string;
}
```

## Rules

- The expense form requires amount, payment method, description, register and occurrence date-time.
- The default register is the active one; when there is no active register the most recent register is preselected.
- Creating an expense remains available without an open register as long as at least one register exists.
- `cancelled === false` expenses in an `OPEN` register can be deleted.
- `cancelled === false` expenses in a `CLOSED` register can only be cancelled with a reason.
- `cancelled === true` expenses are read-only and excluded from monetary totals.
