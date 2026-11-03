import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

export type DeleteHandler = (id: string) => Observable<void>;

export interface DeleteHandlerRegistration {
  resource: string;
  execute: DeleteHandler;
}

export const DELETE_HANDLERS = new InjectionToken<DeleteHandlerRegistration[]>(
  'DELETE_HANDLERS',
  { factory: () => [] },
);
