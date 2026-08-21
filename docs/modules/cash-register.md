# Cash Register

Session-based cash control for opening balances, movements, expected closing balances, and history.

## Routes

- `/cash-register`: current session, details, movements, open/close actions.
- `/cash-register/history`: paginated simple or detailed session history.

## API

The feature calls `/api/cash-register/active`, `/open`, `/{id}/close`, `/{id}/movements`, and `/history`.

## Rules

- Only one active session is expected for the current operator scope.
- Monetary operations require an open session.
- Closing records declared balance, notes, and difference from expected balance.
- Movement types are defined in `models/enums/cash-movement-type.enum.ts` and displayed in Spanish.
