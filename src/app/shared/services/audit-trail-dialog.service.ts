import { Injectable, signal } from '@angular/core';
import { AuditTrailRequest } from '@features/platform/audit/models';

export type { AuditTrailRequest } from '@features/platform/audit/models';

@Injectable({ providedIn: 'root' })
export class AuditTrailDialogService {
  readonly request = signal<AuditTrailRequest | null>(null);

  open(request: AuditTrailRequest): void {
    this.request.set(request);
  }

  close(): void {
    this.request.set(null);
  }
}
