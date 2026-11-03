import { Injectable, inject } from '@angular/core';
import { ListNavigationService } from '@shared/components/list/list-navigation.service';
import { LIST_NAVIGATION_DEFINITIONS } from '../config/list-navigation.config';
import { moduleForUrl } from '@features/platform/auth/authorization/models/permission-context';
import { LookupSessionService } from './lookup-session.service';
import { ActionDispatcherService } from './action-dispatcher.service';

@Injectable({ providedIn: 'root' })
export class NavigationLookupService {
  private readonly navigation = inject(ListNavigationService);
  private readonly dispatcher = inject(ActionDispatcherService);
  private readonly session = inject(LookupSessionService);

  open(route: string, label: string, queryParams?: Record<string, string>): void {
    const definition = LIST_NAVIGATION_DEFINITIONS.find((item) => item.route === route);
    const destinationItem = definition?.destinations?.find((item) => item.label === label);
    if (destinationItem?.routerLink) {
      const destinationModule = destinationItem.requiredModule ?? null;
      if (
        !this.navigation.allowed(
          {
            label,
            icon: destinationItem.icon,
            requiredAction: destinationItem.requiredAction ?? 'READ',
            command: () => undefined,
          },
          destinationModule,
        )
      )
        return;
      this.navigation.dismiss();
      this.dispatcher.dispatchDestination(destinationItem, queryParams);
      return;
    }
    const definitionAction = definition?.actions.find((item) => item.label === label);
    const module = moduleForUrl(route);
    if (!definitionAction || !module) return;
    const permission = { ...definitionAction, command: () => undefined };
    if (!this.navigation.allowed(permission, module)) return;
    this.navigation.dismiss();
    if (this.dispatcher.dispatchDirect(route, label)) return;
    this.session.open({
      route,
      label,
      module,
      definitionAction,
      queryParams,
      onSelect: (record) =>
        this.dispatcher.dispatchRecord({ route, label, record, queryParams }),
    });
  }
}
