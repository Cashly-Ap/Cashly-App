import { InjectionToken, Type } from '@angular/core';

export interface GlobalDialogHostRegistration {
  key: string;
  load: () => Promise<Type<unknown>>;
}

export interface LoadedGlobalDialogHost {
  key: string;
  component: Type<unknown>;
}

export const GLOBAL_DIALOG_HOSTS = new InjectionToken<GlobalDialogHostRegistration[]>(
  'GLOBAL_DIALOG_HOSTS',
  { factory: () => [] },
);
