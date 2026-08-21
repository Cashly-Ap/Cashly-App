# Tasks: Portal Payment Invoice Allocation (parsun-app)

TDD throughout. Run `bun run test:run` from `parsun-app/`.

1. [ ] Confirm whether `ReceivablesApplicationService.loadPendingPayments()` / paged `GET /receivables/payments/pending` path shares `PendingPayment` and needs the same field; adjust if so.
2. [ ] Rename `voucherPath` → `voucherUrl` in `pending-payment.interface.ts` and update the 2 existing spec mocks.
3. [ ] Failing test: "Ver justificante" button renders disabled when `voucherUrl` is null.
4. [ ] Failing test: button renders enabled and triggers voucher open when `voucherUrl` is set.
5. [ ] Implement button + handler in `pending-payments-tab.component.ts`/`.html`.
6. [ ] `bun run test:run` + `bun run format:check` clean.
