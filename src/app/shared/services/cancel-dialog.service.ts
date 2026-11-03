import { Injectable, Injector, inject, signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { TranslationService } from '@core/i18n/translation.service';
import { CANCEL_HANDLERS, CancelHandlerRegistration } from './cancel-handlers.token';

export interface CancelRequest {
  resource: string;
  id: string;
  label: string;
}

@Injectable({ providedIn: 'root' })
export class CancelDialogService {
  private readonly handlers = inject(CANCEL_HANDLERS);
  private readonly injector = inject(Injector);
  readonly request = signal<CancelRequest | null>(null);
  readonly loading = signal(false);
  private success: (() => void) | undefined;

  open(resource: string, id: string, label: string, success?: () => void): void {
    this.success = success;
    this.request.set({ resource, id, label: this.cleanLabel(label) });
  }

  close(): void {
    if (!this.loading()) this.request.set(null);
  }

  confirm(reason: string): void {
    const request = this.request();
    if (!request || this.loading() || !reason.trim()) return;

    const handler: CancelHandlerRegistration | undefined = this.handlers.find(
      (item) => item.resource === request.resource,
    );

    if (!handler) {
      this.showError('common.cancel.missingHandler');
      return;
    }

    this.loading.set(true);
    handler.execute(request.id, reason).subscribe({
      next: () => {
        this.loading.set(false);
        this.request.set(null);
        this.success?.();
        this.success = undefined;
        this.messages?.add({
          severity: 'success',
          summary: this.t('common.cancel.title'),
          detail: this.t('common.cancel.success', { label: request.label }),
          life: 3000,
        });
      },
      error: (error: unknown) => {
        this.loading.set(false);
        this.messages?.add({
          severity: 'error',
          summary: this.t('common.cancel.title'),
          detail: this.errorMessage(error),
          life: 5000,
        });
      },
    });
  }

  private cleanLabel(label: string): string {
    return label.replace(/[$«»]/g, '').trim();
  }

  private get messages(): MessageService | null {
    return this.injector.get(MessageService, null);
  }

  private t(key: string, parameters?: Record<string, string | number | null | undefined>): string {
    return this.injector.get(TranslationService, null)?.t(key, parameters) ?? key;
  }

  private showError(key: string): void {
    this.messages?.add({
      severity: 'error',
      summary: this.t('common.cancel.title'),
      detail: this.t(key),
      life: 5000,
    });
  }

  private errorMessage(error: unknown): string {
    if (
      typeof error === 'object' &&
      error !== null &&
      'error' in error &&
      typeof error.error === 'object' &&
      error.error !== null &&
      'message' in error.error &&
      typeof error.error.message === 'string'
    ) {
      return error.error.message;
    }

    return this.t('common.cancel.error');
  }
}
