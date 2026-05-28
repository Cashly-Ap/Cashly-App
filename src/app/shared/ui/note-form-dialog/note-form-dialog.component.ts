import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CreditNoteApiService } from '@features/credit-notes/services/api/credit-note-api.service';
import { DebitNoteApiService } from '@features/debit-notes/services/api/debit-note-api.service';
import { InvoiceDetails } from '@features/invoices/models/interfaces';

type NoteType = 'CREDIT' | 'DEBIT';

@Component({
  selector: 'app-note-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TextareaModule,
    InputNumberModule,
    SelectModule,
    DialogModule,
    ToastModule,
  ],
  providers: [MessageService],
  template: `
    <p-toast position="top-right" />

    <p-dialog
      [header]="headerLabel()"
      [modal]="true"
      [visible]="visible()"
      [style]="{ width: 'min(90vw, 520px)' }"
      [draggable]="false"
      [resizable]="false"
      (onHide)="onCancel()"
    >
      <div class="flex flex-col gap-4 py-2">
        <!-- Tipo -->
        <div class="rounded-xl p-3 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700">
          <label class="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Tipo *</label>
          <p-select
            [options]="noteTypeOptions"
            [ngModel]="noteType()"
            (ngModelChange)="noteType.set($event)"
            optionLabel="label"
            optionValue="value"
            styleClass="w-full"
            appendTo="body"
          />
        </div>

        <!-- Cliente -->
        <div class="rounded-xl p-3 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700">
          <p class="text-sm text-surface-600 dark:text-surface-400">
            <span class="font-semibold text-surface-800 dark:text-surface-200">Cliente:</span>
            {{ invoice().customerName }} — {{ invoice().customerRif }}
          </p>
        </div>

        <!-- Monto -->
        <div class="rounded-xl p-3 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700">
          <label class="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Monto *</label>
          <p-inputNumber
            [ngModel]="amount()"
            (ngModelChange)="amount.set($event ?? 0)"
            [min]="1"
            [maxFractionDigits]="2"
            [max]="999999999"
            inputStyleClass="w-full"
            styleClass="w-full"
            placeholder="0.00"
          />
        </div>

        <!-- Motivo -->
        <div class="rounded-xl p-3 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700">
          <label class="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Motivo *</label>
          <textarea
            pTextarea
            [ngModel]="reason()"
            (ngModelChange)="reason.set($event)"
            rows="3"
            class="w-full"
            placeholder="Motivo de la nota..."
          ></textarea>
        </div>
      </div>

      <ng-template pTemplate="footer">
        <div class="flex gap-2 justify-end">
          <p-button label="Cancelar" [outlined]="true" severity="secondary" (onClick)="onCancel()" />
          <p-button
            [label]="submitLabel()"
            icon="pi pi-check"
            severity="contrast"
            [loading]="isSubmitting()"
            [disabled]="!canSubmit()"
            (onClick)="submit()"
          />
        </div>
      </ng-template>
    </p-dialog>
  `,
})
export class NoteFormDialogComponent {
  private readonly creditNoteApi = inject(CreditNoteApiService);
  private readonly debitNoteApi = inject(DebitNoteApiService);
  private readonly messageService = inject(MessageService);

  readonly visible = input<boolean>(false);
  readonly invoice = input.required<InvoiceDetails>();

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  readonly noteType = signal<NoteType>('CREDIT');
  readonly amount = signal(0);
  readonly reason = signal('');

  readonly isSubmitting = signal(false);

  readonly noteTypeOptions = [
    { label: 'Nota de Crédito', value: 'CREDIT' as NoteType },
    { label: 'Nota de Débito', value: 'DEBIT' as NoteType },
  ];

  readonly headerLabel = computed(() => {
    const inv = this.invoice().invoiceNumber;
    return this.noteType() === 'CREDIT'
      ? `Nueva Nota de Crédito — #${inv}`
      : `Nueva Nota de Débito — #${inv}`;
  });

  readonly submitLabel = computed(() =>
    this.noteType() === 'CREDIT' ? 'Guardar Nota de Crédito' : 'Guardar Nota de Débito',
  );

  readonly canSubmit = computed(() =>
    this.amount() > 0 && this.reason().trim().length > 0,
  );

  submit(): void {
    if (!this.canSubmit()) return;

    this.isSubmitting.set(true);
    const inv = this.invoice();

    if (this.noteType() === 'CREDIT') {
      this.creditNoteApi.create({
        customerId: inv.customerId,
        invoiceId: inv.id,
        amount: this.amount(),
        reason: this.reason().trim(),
      }).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Nota de crédito creada exitosamente', life: 3000 });
          this.confirmed.emit();
        },
        error: () => {
          this.isSubmitting.set(false);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al crear la nota de crédito', life: 5000 });
        },
      });
    } else {
      this.debitNoteApi.create({
        customerId: inv.customerId,
        invoiceId: inv.id,
        amount: this.amount(),
        reason: this.reason().trim(),
      }).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Nota de débito creada exitosamente', life: 3000 });
          this.confirmed.emit();
        },
        error: () => {
          this.isSubmitting.set(false);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al crear la nota de débito', life: 5000 });
        },
      });
    }
  }

  onCancel(): void {
    this.noteType.set('CREDIT');
    this.amount.set(0);
    this.reason.set('');
    this.cancelled.emit();
  }
}
