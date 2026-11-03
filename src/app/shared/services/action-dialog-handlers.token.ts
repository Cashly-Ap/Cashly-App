import { InjectionToken, Type } from '@angular/core';

export interface ActionDialogHandlerRegistration {
  resource: string;
  label: string;
  component: Type<unknown>;
}

export const ACTION_DIALOG_HANDLERS = new InjectionToken<ActionDialogHandlerRegistration[]>(
  'ACTION_DIALOG_HANDLERS',
  { factory: () => [] },
);
