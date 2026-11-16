import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { ButtonModule, ButtonSeverity } from 'primeng/button';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { ShortcutDirective } from '@core/shortcuts/shortcut.directive';
import { PermissionDirective } from '@features/platform/auth/authorization/directives/permission.directive';
import { PermissionAction } from '@features/platform/auth/authorization/models/access.model';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';
import { AppPermission } from '@features/platform/auth/permissions/app-permission';

export type SubmitButtonAction = 'new' | 'submit';

@Component({
  selector: 'app-submit-button',
  standalone: true,
  imports: [ButtonModule, TranslatePipe, ShortcutDirective, PermissionDirective],
  templateUrl: './submit-button.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubmitButtonComponent {
  readonly labelKey = input('shared.save');
  readonly label = input<string | null>(null);
  readonly shortcut = input<SubmitButtonAction>('submit');
  readonly permission = input<PermissionAction | null>(null);
  readonly permissionModule = input<BusinessModule | string | null>(null);
  readonly requiredPermissions = input<string[]>([]);
  readonly permissionCode = input<AppPermission | null>(null);
  readonly icon = input<string | null>(null);
  readonly severity = input<ButtonSeverity>('contrast');
  readonly type = input<'button' | 'submit'>('button');
  readonly styleClass = input<string | null>(null);
  readonly disabled = input(false);
  readonly loading = input(false);

  readonly action = output<void>();

  readonly resolvedPermission = computed(
    () => this.permission() ?? (this.shortcut() === 'new' ? 'CREATE' : null),
  );

  readonly resolvedIcon = computed(
    () => this.icon() ?? (this.shortcut() === 'new' ? 'pi pi-plus' : 'pi pi-check'),
  );

  readonly resolvedStyleClass = computed(
    () => this.styleClass() ?? (this.shortcut() === 'new' ? 'font-medium w-full sm:w-auto' : ''),
  );
}
