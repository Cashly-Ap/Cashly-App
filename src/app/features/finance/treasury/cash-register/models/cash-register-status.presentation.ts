import { StatusSeverity } from '@shared/models/status-variant';

export function cashRegisterStatusSeverity(status: string | undefined): StatusSeverity {
  switch (status) {
    case 'OPEN':
      return 'info';
    case 'CLOSED':
      return 'warn';
    case 'VERIFIED':
      return 'success';
    default:
      return 'contrast';
  }
}
