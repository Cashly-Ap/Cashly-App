import { Injectable, Provider, inject } from '@angular/core';
import { Confirmation, ConfirmationService, MessageService, ToastMessageOptions } from 'primeng/api';
import { TranslationService } from './translation.service';

@Injectable()
export class TranslatedMessageService extends MessageService {
  private readonly translations = inject(TranslationService);
  override add(message: ToastMessageOptions): void {
    super.add({
      ...message,
      summary: this.translations.t(message.summary),
      detail: this.translations.t(message.detail),
    });
  }
  override addAll(messages: ToastMessageOptions[]): void {
    for (const message of messages) this.add(message);
  }
}

@Injectable()
export class TranslatedConfirmationService extends ConfirmationService {
  private readonly translations = inject(TranslationService);
  override confirm(confirmation: Confirmation): this {
    return super.confirm({
      ...confirmation,
      header: this.translations.t(confirmation.header),
      message: this.translations.t(confirmation.message),
      ...(confirmation.acceptLabel ? { acceptLabel: this.translations.t(confirmation.acceptLabel) } : {}),
      ...(confirmation.rejectLabel ? { rejectLabel: this.translations.t(confirmation.rejectLabel) } : {}),
    });
  }
}

export function provideTranslatedMessages(): Provider {
  return { provide: MessageService, useClass: TranslatedMessageService };
}
export function provideTranslatedConfirmation(): Provider {
  return { provide: ConfirmationService, useClass: TranslatedConfirmationService };
}
