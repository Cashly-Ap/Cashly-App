import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuditTrailDialogService } from '@shared/services/audit-trail-dialog.service';
import { AuditTrailDialogComponent } from '@features/platform/audit/components/audit-trail-dialog/audit-trail-dialog.component';

@Component({
  selector: 'app-audit-trail-dialog-host',
  standalone: true,
  imports: [AuditTrailDialogComponent],
  templateUrl: './audit-trail-dialog-host.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuditTrailDialogHostComponent {
  readonly dialog = inject(AuditTrailDialogService);
}
