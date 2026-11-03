import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

export type CancelHandler = (id: string, reason: string) => Observable<void>;

export interface CancelHandlerRegistration {
  resource: string;
  execute: CancelHandler;
}

export const CANCEL_HANDLERS = new InjectionToken<CancelHandlerRegistration[]>(
  'CANCEL_HANDLERS',
  { factory: () => [] },
);
