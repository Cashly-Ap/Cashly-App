import { TranslatePipe } from '@core/i18n/translate.pipe';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { AuthorizationService } from '@features/platform/auth/authorization/services/authorization.service';
import { moduleForUrl } from '@features/platform/auth/authorization/models/permission-context';
import { ButtonModule } from 'primeng/button';
import { PopoverModule } from 'primeng/popover';
import { TooltipModule } from 'primeng/tooltip';

export interface ListAction {
  label: string;
  requiredPermissions?: string[];
  requiredAction?: import('@features/platform/auth/authorization/models/access.model').PermissionAction;
  icon: string;
  command: () => void;
  danger?: boolean;
  disabled?: boolean;
}

@Component({
  selector: 'app-list-action-buttons',
  standalone: true,
  imports: [TranslatePipe, ButtonModule, PopoverModule, TooltipModule],
  templateUrl: './list-action-buttons.component.html',
  host: { class: 'flex w-full justify-center' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListActionButtonsComponent {
  private readonly authorization = inject(AuthorizationService);
  private readonly router = inject(Router);
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );
  readonly actions = input.required<readonly ListAction[]>();
  readonly ariaLabel = input('Abrir acciones del registro');
  readonly orderedActions = computed(() => {
    const priorities = new Map([
      ['Ver detalle', 0],
      ['Editar', 1],
      ['Eliminar', 2],
    ]);
    return this.actions()
      .filter((action) => this.isAllowed(action))
      .map((action, index) => ({ action, index }))
      .sort(
        (left, right) =>
          (priorities.get(left.action.label) ?? 3) - (priorities.get(right.action.label) ?? 3) ||
          left.index - right.index,
      )
      .map(({ action }) => action);
  });

  execute(action: ListAction): void {
    if (action.disabled || !this.isAllowed(action)) return;
    action.command();
  }

  private isAllowed(action: ListAction): boolean {
    const module = moduleForUrl(this.currentUrl());
    return (
      !!module &&
      !!action.requiredAction &&
      this.authorization.can(module, action.requiredAction) &&
      (action.requiredPermissions ?? []).every((grant) => {
        const [owner, required] = grant.split(':');
        return this.authorization.can(
          owner as BusinessModule,
          required as import('@features/platform/auth/authorization/models/access.model').PermissionAction,
        );
      }) &&
      (action.requiredAction !== 'EXPORT' ||
        this.authorization.can(BusinessModule.DOCUMENT_ADMIN, 'EXPORT'))
    );
  }
}
