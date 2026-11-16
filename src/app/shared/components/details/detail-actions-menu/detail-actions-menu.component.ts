import { TranslatePipe } from '@core/i18n/translate.pipe';
import { PermissionDirective } from '@features/platform/auth/authorization/directives/permission.directive';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Popover, PopoverModule } from 'primeng/popover';
import { AuthorizationService } from '@features/platform/auth/authorization/services/authorization.service';
import { AuditEntityType, AuditTrailRequest } from '@features/platform/audit/models';
import { AuditPermission } from '@features/platform/audit/permissions';
import { AuditTrailActionComponent } from '@features/platform/audit/components/audit-trail-action/audit-trail-action.component';

@Component({
  selector: 'app-detail-actions-menu',
  standalone: true,
  imports: [TranslatePipe, ButtonModule, PopoverModule, AuditTrailActionComponent],
  templateUrl: './detail-actions-menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailActionsMenuComponent {
  private readonly actions = contentChildren(PermissionDirective, { descendants: true });
  private readonly authorization = inject(AuthorizationService);
  private readonly popover = viewChild.required<Popover>('actionsPopover');

  readonly auditEntityType = input<AuditEntityType>();
  readonly auditEntityId = input<string>();
  readonly auditLabel = input<string>();
  readonly auditSubtitle = input<string>();

  readonly audit = computed<AuditTrailRequest | null>(() => {
    const entityType = this.auditEntityType();
    const label = this.auditLabel();
    if (!entityType || !label || !this.authorization.can(AuditPermission.VIEW_LIST)) return null;
    const entityId = this.auditEntityId();
    const subtitle = this.auditSubtitle();
    return {
      entityType,
      ...(entityId ? { entityId } : {}),
      label,
      ...(subtitle ? { subtitle } : {}),
    };
  });

  readonly hasActions = computed(
    () => !!this.audit() || this.actions().some((action) => action.allowed()),
  );

  hide(): void {
    this.popover().hide();
  }
}
