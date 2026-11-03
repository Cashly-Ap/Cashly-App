import { Injectable, inject } from '@angular/core';
import {
  NAVIGATION_ACTION_HANDLERS,
  NavigationActionRecord,
} from './navigation-action-handlers.token';

@Injectable({ providedIn: 'root' })
export class NavigationActionService {
  private readonly handlers = inject(NAVIGATION_ACTION_HANDLERS);

  execute(resource: string, label: string, record: NavigationActionRecord): boolean {
    const handler = this.handlers.find(
      (item) => item.resource === resource && item.label === label,
    );
    if (!handler) return false;
    handler.execute(record);
    return true;
  }
}
