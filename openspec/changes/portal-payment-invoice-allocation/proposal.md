# Proposal: Portal Payment Invoice Allocation — cashly-app slice

## Intent

Wire up the already-declared-but-dead `voucherPath` field in the admin receivables "pending payments" tab to real backend data, so staff can view the voucher/receipt file a customer attached to a payment before approving it.

This is the `cashly-app` slice of a larger cross-repo change; the backend contract change (`cashly-api`, same change name) adds `voucherUrl`/`targetInvoiceId` to `PaymentResponse`/`PaymentListResponse`.

## Why

Staff approving payments currently have no way to see proof of payment, even though customers can attach one. `PendingPayment.voucherPath` was declared for this but never connected to a data source or UI element.

## Scope

In scope:
- Rename `PendingPayment.voucherPath` → `voucherUrl: string | null` (matches the real backend field name being added — the old field was always `null`/unpopulated dead code).
- `pending-payments-tab.component`: add a "Ver justificante" button, always visible, disabled when `voucherUrl` is `null`. Reuse the existing, currently-unused `ImageViewerDialogComponent` (`shared/components/ui/image-viewer-dialog/`) for the preview — it was purpose-built for payment vouchers. Fall back to opening the URL directly (e.g. `window.open`) for non-image files (PDFs) since `ImageViewerDialogComponent` is documented as images-only.

Out of scope: any change to the two other pending-payment data paths (`ReceivablesApplicationService.loadPendingPayments()` / the paged `GET /receivables/payments/pending` endpoint) unless they turn out to share the same DTO and need the same rename — confirm during Explore/Apply.

## Risks

Low — additive UI change plus a rename of a field that's confirmed dead (only referenced in 2 test mocks, always `null`).

## Rollback

`git revert`. No persisted state involved.
