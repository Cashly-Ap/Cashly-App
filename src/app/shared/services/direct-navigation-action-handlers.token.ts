import { InjectionToken } from '@angular/core';

export interface DirectNavigationActionHandlerRegistration {
  resource: string;
  label: string;
  execute: () => void;
}

export const DIRECT_NAVIGATION_ACTION_HANDLERS = new InjectionToken<
  DirectNavigationActionHandlerRegistration[]
>('DIRECT_NAVIGATION_ACTION_HANDLERS', { factory: () => [] });
