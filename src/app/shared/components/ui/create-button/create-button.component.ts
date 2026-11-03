import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonModule, ButtonSeverity } from 'primeng/button';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { ShortcutDirective } from '@core/shortcuts/shortcut.directive';
import { PermissionDirective } from '@features/platform/auth/authorization/directives/permission.directive';
import { PermissionAction } from '@features/platform/auth/authorization/models/access.model';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';

@Component({
  selector: 'app-create-button',
  standalone: true,
  imports: [ButtonModule, TranslatePipe, ShortcutDirective, PermissionDirective],
  templateUrl: './create-button.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateButtonComponent {
  readonly labelKey = input.required<string>();
  readonly permission = input<PermissionAction>('CREATE');
  readonly permissionModule = input<BusinessModule | string | null>(null);
  readonly requiredPermissions = input<string[]>([]);
  readonly icon = input('pi pi-plus');
  readonly severity = input<ButtonSeverity>('contrast');
  readonly styleClass = input('font-medium w-full sm:w-auto');
  readonly disabled = input(false);
  readonly loading = input(false);

  readonly create = output<void>();
}
