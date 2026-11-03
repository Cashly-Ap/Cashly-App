import { inject as i18nInject } from '@angular/core';
import { LanguageService as I18nLanguageService } from '@core/i18n/language.service';
import { TranslateOptionsPipe } from '@core/i18n/translate-options.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageService } from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { CreditNoteApiService } from '@features/finance/billing/credit-notes/services/api/credit-note-api.service';
import { DebitNoteApiService } from '@features/finance/billing/debit-notes/services/api/debit-note-api.service';
import { InvoiceDetails } from '@features/finance/billing/invoices/models/interfaces/invoice-details.interface';

type NoteType = 'CREDIT' | 'DEBIT';

import { CancelButtonComponent } from '@shared/components/ui/cancel-button/cancel-button.component';
import { SubmitButtonComponent } from '@shared/components/ui/submit-button/submit-button.component';
@Component({
  selector: 'app-note-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SubmitButtonComponent,
    CancelButtonComponent,
    TranslateOptionsPipe,
    TranslatePipe,
    FormsModule,
    ButtonModule,
    TextareaModule,
    InputNumberModule,
    SelectModule,
    DialogModule,
  ],
  templateUrl: './note-form-dialog.component.html',
})
export class NoteFormDialogComponent {
  readonly i18nLanguage = i18nInject(I18nLanguageService);
  private readonly creditNoteApi = inject(CreditNoteApiService);
  private readonly debitNoteApi = inject(DebitNoteApiService);
  private readonly messageService = inject(MessageService);

  readonly visible = input(false);
  readonly invoice = input.required<InvoiceDetails>();

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  readonly noteType = signal<NoteType>('CREDIT');
  readonly amount = signal(0);
  readonly reason = signal('');
  readonly isSubmitting = signal(false);
  readonly formAttempted = signal(false);

  readonly noteTypeOptions = [
    { label: 'Nota de Crédito', value: 'CREDIT' as NoteType },
    { label: 'Nota de Débito', value: 'DEBIT' as NoteType },
  ];

  readonly headerLabel = computed(() => {
    const invoiceNumber = this.invoice().invoiceNumber;
    return this.noteType() === 'CREDIT'
      ? `Nueva Nota de Crédito — #${invoiceNumber}`
      : `Nueva Nota de Débito — #${invoiceNumber}`;
  });

  readonly submitLabel = computed(() =>
    this.noteType() === 'CREDIT' ? 'Guardar Nota de Crédito' : 'Guardar Nota de Débito',
  );

  readonly canSubmit = computed(() => this.amount() > 0 && this.reason().trim().length > 0);

  submit(): void {
    this.formAttempted.set(true);
    if (!this.canSubmit()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario incompleto',
        detail: 'Ingrese un monto mayor a cero y el motivo de la nota.',
        life: 5000,
      });
      return;
    }

    this.isSubmitting.set(true);
    const invoice = this.invoice();
    const request = {
      customerId: invoice.customerId,
      invoiceId: invoice.id,
      amount: this.amount(),
      reason: this.reason().trim(),
    };

    const creation$ =
      this.noteType() === 'CREDIT'
        ? this.creditNoteApi.create(request)
        : this.debitNoteApi.create(request);

    const isCredit = this.noteType() === 'CREDIT';

    creation$.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'shared.notes.noteRegistered',
          detail: isCredit
            ? 'shared.notes.creditNoteCreatedSuccessfully'
            : 'shared.notes.debitNoteCreatedSuccessfully',
          life: 4000,
        });
        this.confirmed.emit();
      },
      error: (error: { error?: { message?: string } }) => {
        this.isSubmitting.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'shared.notes.unableToRegisterTheNote',
          detail:
            error.error?.message ||
            (isCredit
              ? 'shared.notes.unableToCreateTheCreditNote'
              : 'shared.notes.unableToCreateTheDebitNote'),
          life: 6000,
        });
      },
    });
  }

  onCancel(): void {
    this.noteType.set('CREDIT');
    this.amount.set(0);
    this.reason.set('');
    this.formAttempted.set(false);
    this.cancelled.emit();
  }
}
