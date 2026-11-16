import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { AuthorizationService } from '@features/platform/auth/authorization/services/authorization.service';
import { AuditTrailDialogService } from '@shared/services/audit-trail-dialog.service';
import { AuditEntityType } from '@features/platform/audit/models';
import { AuditPermission } from '@features/platform/audit/permissions';

@Component({
  selector: 'app-audit-trail-action',
  standalone: true,
  imports: [ButtonModule, TranslatePipe],
  templateUrl: './audit-trail-action.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuditTrailActionComponent {
  private readonly authorization = inject(AuthorizationService);
  private readonly dialog = inject(AuditTrailDialogService);

  readonly entityType = input.required<AuditEntityType>();
  readonly entityId = input<string>();
  readonly label = input.required<string>();
  readonly subtitle = input<string>();
  readonly module = input<string>();

  visible(): boolean {
    return this.authorization.can(AuditPermission.VIEW_LIST);
  }

  open(): void {
    this.dialog.open({
      entityType: this.entityType(),
      ...(this.entityId() ? { entityId: this.entityId() } : {}),
      ...(this.module() ? { module: this.module() } : {}),
      label: this.label(),
      ...(this.subtitle() ? { subtitle: this.subtitle() } : {}),
    });
  }
}
