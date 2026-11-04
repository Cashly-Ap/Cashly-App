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
  private version = 0;
  readonly request = signal<ReportActionRequest | null>(null);

  open(key: string): boolean {
    const handler: ReportActionHandlerRegistration | undefined = this.handlers.find(
      (item) => item.key === key,
    );
    if (!handler) return false;
    const version = ++this.version;
    void handler
      .load()
      .then((component) => {
        if (version !== this.version) return;
        this.request.set({ component, inputs: handler.inputs ?? {} });
      })
      .catch(() => {
        if (version === this.version) this.request.set(null);
      });
    return true;
  }

  close(): void {
    this.version++;
    this.request.set(null);
  }
}
