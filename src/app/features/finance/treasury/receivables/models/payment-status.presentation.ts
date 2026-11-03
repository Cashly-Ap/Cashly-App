import { StatusSeverity } from '@shared/models/status-variant';

export function paymentStatusSeverity(status: string): StatusSeverity {
  switch (status) {
    case 'APPLIED':
      return 'success';
    case 'CANCELLED':
      return 'danger';
    default:
      return 'info';
  }
}
