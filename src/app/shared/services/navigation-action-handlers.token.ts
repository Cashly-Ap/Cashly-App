import { InjectionToken } from '@angular/core';

export interface NavigationActionRecord {
  id: string;
  label: string;
  description: string;
}

export interface NavigationActionHandlerRegistration {
  resource: string;
  label: string;
  execute: (record: NavigationActionRecord) => void;
}

export const NAVIGATION_ACTION_HANDLERS = new InjectionToken<
  NavigationActionHandlerRegistration[]
>('NAVIGATION_ACTION_HANDLERS', { factory: () => [] });
