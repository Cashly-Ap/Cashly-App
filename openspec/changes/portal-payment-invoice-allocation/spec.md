# Spec: Portal Payment Invoice Allocation — parsun-app slice

## Requirement: Voucher button visibility follows data availability

### Scenario: Pending payment has a voucher
- **Given** a row in the pending-payments table with `voucherUrl` set
- **When** the table renders
- **Then** the "Ver justificante" button is visible and enabled
- **And** clicking it opens the voucher (image preview via `ImageViewerDialogComponent`, or direct open for non-image URLs)

### Scenario: Pending payment has no voucher
- **Given** a row in the pending-payments table with `voucherUrl = null`
- **When** the table renders
- **Then** the "Ver justificante" button is visible but disabled
