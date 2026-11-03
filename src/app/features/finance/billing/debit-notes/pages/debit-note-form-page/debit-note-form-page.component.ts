import { LanguageService } from '@core/i18n/language.service';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { NavigationHistoryService } from '@core/navigation/navigation-history.service';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { InvoicePickerDialogComponent } from '@shared/ui/invoice-picker-dialog/invoice-picker-dialog.component';
import { MessageService } from 'primeng/api';
import { FormContainerComponent } from '@core/forms/components/cards/form-container/form-container.component';
import { FormHeaderComponent } from '@core/forms/components/headers/form-header/form-header.component';

import { FormActionsComponent } from '@core/forms/components/headers/form-actions/form-actions.component';
import { DebitNoteApplicationService } from '@features/finance/billing/debit-notes/services/application/debit-note-application.service';
import { CustomerList } from '@features/partners/customers/models/interfaces/customer-list.interface';
import { CustomerPickerDialogComponent } from '@features/sales/orders/components/customer-picker-dialog/customer-picker-dialog.component';
import { InvoiceList } from '@features/finance/billing/invoices/models/interfaces/invoice-list.interface';

import { PanelCardComponent } from '@shared/components/ui/panel-card/panel-card.component';
import { PickerTriggerComponent } from '@shared/components/ui/picker-trigger/picker-trigger.component';
@Component({
  selector: 'app-debit-note-form-page',
  standalone: true,
  imports: [
    PickerTriggerComponent,
    PanelCardComponent,
    TranslatePipe,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    TextareaModule,
    InputNumberModule,
    CommonModule,
    FormContainerComponent,
    FormHeaderComponent,
    FormActionsComponent,
    CustomerPickerDialogComponent,
    InvoicePickerDialogComponent,
  ],
  templateUrl: './debit-note-form-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DebitNoteFormPageComponent implements OnInit {
  readonly locale = inject(LanguageService).locale;

  private readonly navigationHistory = inject(NavigationHistoryService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(DebitNoteApplicationService);
  private readonly messageService = inject(MessageService);

  readonly isSubmitting = signal<boolean>(false);
  readonly selectedCustomer = signal<CustomerList | null>(null);
  readonly selectedCustomerLabel = signal<{ alias: string; legalName: string } | null>(null);
  readonly pickerVisible = signal<boolean>(false);

  readonly showInvoicePicker = signal(false);
  readonly selectedInvoice = signal<InvoiceList | null>(null);

  readonly selectedCustomerId = computed(() => this.selectedCustomer()?.id ?? null);

  readonly submitTooltip = signal('');

  private readonly FIELD_LABELS: Record<string, string> = {
    customerId: 'Cliente',
    invoiceId: 'Factura',
    amount: 'Monto',
    reason: 'Motivo',
  };

  readonly form = this.fb.group({
    customerId: ['', [Validators.required]],
    invoiceId: ['', [Validators.required]],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    reason: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.form.statusChanges.subscribe(() => this.updateSubmitTooltip());
    this.updateSubmitTooltip();
  }

  private updateSubmitTooltip(): void {
    const invalid = Object.entries(this.FIELD_LABELS)
      .filter(([key]) => this.form.get(key)?.invalid)
      .map(([, label]) => label);
    this.submitTooltip.set(invalid.length ? `Campos requeridos: ${invalid.join(', ')}` : '');
  }

  openPicker(): void {
    this.pickerVisible.set(true);
  }

  onCustomerSelected(customer: CustomerList): void {
    this.selectedCustomer.set(customer);
    this.selectedCustomerLabel.set({ alias: customer.alias, legalName: customer.legalName });
    this.form.patchValue({ customerId: customer.id });
    this.pickerVisible.set(false);
  }

  onPickerCancelled(): void {
    this.pickerVisible.set(false);
  }

  onInvoiceSelected(invoice: InvoiceList): void {
    this.selectedInvoice.set(invoice);
    this.form.patchValue({ invoiceId: invoice.id });
    if (!this.selectedCustomer()) {
      this.selectedCustomer.set({
        id: invoice.customerId,
        alias: invoice.customerName,
        legalName: '',
      } as CustomerList);
      this.selectedCustomerLabel.set({ alias: invoice.customerName, legalName: '' });
      this.form.patchValue({ customerId: invoice.customerId });
    }
    this.showInvoicePicker.set(false);
  }

  onInvoiceCancelled(): void {
    this.showInvoicePicker.set(false);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    const formValue = this.form.value;

    this.service
      .createDebitNote({
        customerId: formValue.customerId ?? '',
        invoiceId: formValue.invoiceId ?? '',
        amount: formValue.amount ?? 0,
        reason: formValue.reason ?? '',
      })
      .subscribe({
        next: (created) => {
          this.isSubmitting.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Nota de débito creada exitosamente',
            life: 3000,
          });
          this.router.navigate(['/finance/billing/debit-notes', created.id]);
        },
        error: () => {
          this.isSubmitting.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al crear la nota de débito',
            life: 5000,
          });
        },
      });
  }

  cancel(): void {
    this.navigationHistory.back(['/finance/billing/debit-notes']);
  }
}
