import { Injectable, Type, inject, signal } from '@angular/core';
import {
  ACTION_DIALOG_HANDLERS,
  ActionDialogHandlerRegistration,
} from '@shared/services/action-dialog-handlers.token';

export interface ActionDialogRequest {
  component: Type<unknown>;
  recordId: string;
}

@Injectable({ providedIn: 'root' })
export class ActionDialogService {
  private readonly handlers = inject(ACTION_DIALOG_HANDLERS);
  readonly request = signal<ActionDialogRequest | null>(null);

  open(resource: string, label: string, recordId: string): boolean {
    const handler: ActionDialogHandlerRegistration | undefined = this.handlers.find(
      (item) => item.resource === resource && item.label === label,
    );
    if (!handler) return false;
    this.request.set({ component: handler.component, recordId });
    return true;
  }

  close(): void {
    this.request.set(null);
  }
}
