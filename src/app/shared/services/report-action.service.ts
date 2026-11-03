import { Injectable, Type, inject, signal } from '@angular/core';
import {
  REPORT_ACTION_HANDLERS,
  ReportActionHandlerRegistration,
} from '@shared/services/report-action-handlers.token';

export interface ReportActionRequest {
  component: Type<unknown>;
  inputs: Record<string, unknown>;
}

@Injectable({ providedIn: 'root' })
export class ReportActionService {
  private readonly handlers = inject(REPORT_ACTION_HANDLERS);
  readonly request = signal<ReportActionRequest | null>(null);

  open(key: string): boolean {
    const handler: ReportActionHandlerRegistration | undefined = this.handlers.find(
      (item) => item.key === key,
    );
    if (!handler) return false;
    this.request.set({ component: handler.component, inputs: handler.inputs ?? {} });
    return true;
  }

  close(): void {
    this.request.set(null);
  }
}
