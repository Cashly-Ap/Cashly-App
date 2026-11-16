import { StatusVariant } from '@shared/models/status-variant';
import { PurchaseStatus } from '@features/procurement/purchases/models/enums/purchase-status.enum';

export function purchaseStatusVariant(status: PurchaseStatus): StatusVariant {
  const variants: Record<PurchaseStatus, StatusVariant> = {
    [PurchaseStatus.DRAFT]: 'label',
    [PurchaseStatus.CONFIRMED]: 'success',
    [PurchaseStatus.CANCELLED]: 'danger',
  };
  return variants[status] ?? 'label';
}
