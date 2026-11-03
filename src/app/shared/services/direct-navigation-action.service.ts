import { Injectable, inject } from '@angular/core';
import { DIRECT_NAVIGATION_ACTION_HANDLERS } from './direct-navigation-action-handlers.token';

@Injectable({ providedIn: 'root' })
export class DirectNavigationActionService {
  private readonly handlers = inject(DIRECT_NAVIGATION_ACTION_HANDLERS);

  execute(resource: string, label: string): boolean {
    const handler = this.handlers.find(
      (item) => item.resource === resource && item.label === label,
    );
    if (!handler) return false;
    handler.execute();
    return true;
  }
}
