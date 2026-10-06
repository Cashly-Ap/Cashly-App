# Design: Portal Payment Invoice Allocation — cashly-app slice

- `features/receivables/models/interfaces/pending-payment.interface.ts`: rename `voucherPath: string | null` → `voucherUrl: string | null`.
- `pending-payments-tab.component.html`: add an icon button after the existing Aprobar/Rechazar actions, following the exact PrimeNG pattern already used for "Ver detalle" in `merchant-payments-tab.component.html` (`p-button icon="pi pi-eye"`, or a file/paperclip icon such as `pi pi-paperclip`, `[rounded]="true" [text]="true" severity="info"`), bound `[disabled]="!payment.voucherUrl"`.
- `pending-payments-tab.component.ts`: add a handler that opens `ImageViewerDialogComponent` with `[imageUrl]="payment.voucherUrl"` when the URL looks like an image (extension check), otherwise `window.open(payment.voucherUrl, '_blank')` as a pragmatic fallback for PDFs — no new PDF-specific viewer wiring, matches YAGNI given this is a small addition, not a new subsystem.
- Update `pending-payments-tab.component.spec.ts` fixture from `voucherPath: null` to `voucherUrl: null` and add a case with a populated value asserting the button becomes enabled.
