import { LanguageService } from '@core/i18n/language.service';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { MessageService } from 'primeng/api';
import {
  FormContainerComponent,
  FormHeaderComponent,
  FormActionsComponent,
} from '@core/forms/components';
import { CreditNoteApplicationService } from '@features/finance/billing/credit-notes/services/application/credit-note-application.service';
import { CreditNoteCreate } from '@features/finance/billing/credit-notes/models/interfaces/credit-note.interface';
import { BaseFormComponent, FormConfig } from '@core/forms/base/base-form.component';
import { CustomerList } from '@features/partners/customers/models/interfaces/customer-list.interface';
import { CustomerPickerDialogComponent } from '@features/sales/orders/components/customer-picker-dialog/customer-picker-dialog.component';
import { InvoiceList } from '@features/finance/billing/invoices/models/interfaces/invoice-list.interface';
import { InvoicePickerDialogComponent } from '@shared/ui/invoice-picker-dialog/invoice-picker-dialog.component';

interface CreditNoteFormData {
  customerId: string;
  customerName: string;
  customerRif: string;
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  reason: string;
}

import { PanelCardComponent } from '@shared/components/ui/panel-card/panel-card.component';
import { PickerTriggerComponent } from '@shared/components/ui/picker-trigger/picker-trigger.component';
@Component({
  selector: 'app-credit-note-form-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PickerTriggerComponent,
    PanelCardComponent,
    TranslatePipe,
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputNumberModule,
    TextareaModule,
    FormContainerComponent,
    FormHeaderComponent,
    FormActionsComponent,
    CustomerPickerDialogComponent,
    InvoicePickerDialogComponent,
  ],
  templateUrl: './credit-note-form-page.component.html',
})
export class CreditNoteFormPageComponent extends BaseFormComponent<CreditNoteFormData> {
  readonly locale = inject(LanguageService).locale;

  private service = inject(CreditNoteApplicationService);
  private messageService = inject(MessageService);

  loading = this.service.loading;

  submitTooltip = signal('');

  readonly selectedCustomer = signal<CustomerList | null>(null);
  readonly selectedCustomerLabel = signal<{ alias: string; legalName: string } | null>(null);
  readonly pickerVisible = signal(false);
  readonly showInvoicePicker = signal(false);
  readonly selectedInvoice = signal<InvoiceList | null>(null);
  readonly selectedInvoiceLabel = signal<{ invoiceNumber: string; customerName: string } | null>(
    null,
  );

  private readonly FIELD_LABELS: Record<string, string> = {
    customerName: 'Cliente',
    invoiceId: 'Factura',
    amount: 'Monto',
    reason: 'Motivo',
  };

  override ngOnInit(): void {
    super.ngOnInit?.();
    this.form.statusChanges.subscribe(() => this.updateSubmitTooltip());
    this.updateSubmitTooltip();
  }

  private updateSubmitTooltip(): void {
    const invalid = Object.entries(this.FIELD_LABELS)
      .filter(([key]) => this.form.get(key)?.invalid)
      .map(([, label]) => label);
    this.submitTooltip.set(invalid.length ? `Campos requeridos: ${invalid.join(', ')}` : '');
  }

  getConfig(): FormConfig {
    return {
      entityDisplayName: 'Nota de Crédito',
      entityArticle: 'la',
      module: 'finances',
      routeBase: '/finance/billing/credit-notes',
    };
  }

  createForm(): FormGroup {
    return this.fb.group({
      customerId: ['', Validators.required],
      customerName: ['', Validators.required],
      customerRif: [''],
      invoiceId: ['', Validators.required],
      invoiceNumber: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      reason: ['', [Validators.required, Validators.maxLength(500)]],
    });
  }

  protected override getPendingTabTitle(formData: CreditNoteFormData): string {
    return `NC - ${formData.customerName || 'Nuevo'}`;
  }

  protected override restoreFormData(data: CreditNoteFormData): void {
    this.form.patchValue(data);
    if (data.customerName) {
      this.selectedCustomerLabel.set({ alias: data.customerName, legalName: '' });
    }
    if (data.invoiceNumber) {
      this.selectedInvoiceLabel.set({
        invoiceNumber: data.invoiceNumber,
        customerName: data.customerName,
      });
    }
  }

  openPicker(): void {
    this.pickerVisible.set(true);
  }

  onCustomerSelected(customer: CustomerList): void {
    const invoice = this.selectedInvoice();
    if (invoice && invoice.customerId !== customer.id) {
      this.selectedInvoice.set(null);
      this.selectedInvoiceLabel.set(null);
      this.form.patchValue({ invoiceId: '', invoiceNumber: '' });
    }
    this.selectedCustomer.set(customer);
    this.selectedCustomerLabel.set({ alias: customer.alias, legalName: customer.legalName });
    this.form.patchValue({
      customerId: customer.id,
      customerName: customer.alias || customer.legalName,
      customerRif: customer.rif,
    });
    this.pickerVisible.set(false);
  }

  onPickerCancelled(): void {
    this.pickerVisible.set(false);
  }

  onInvoiceSelected(invoice: InvoiceList): void {
    this.selectedInvoice.set(invoice);
    this.selectedInvoiceLabel.set({
      invoiceNumber: invoice.invoiceNumber,
      customerName: invoice.customerName,
    });
    this.form.patchValue({
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      customerId: invoice.customerId,
      customerName: invoice.customerName,
    });
    if (this.selectedCustomer()?.id !== invoice.customerId) {
      this.selectedCustomer.set(null);
      this.selectedCustomerLabel.set({ alias: invoice.customerName, legalName: '' });
    }
    this.showInvoicePicker.set(false);
  }

  onInvoiceCancelled(): void {
    this.showInvoicePicker.set(false);
  }

  override onSubmit(): void {
    if (this.form.valid) {
      const value = this.form.getRawValue() as CreditNoteFormData;

      const payload: CreditNoteCreate = {
        customerId: value.customerId,
        invoiceId: value.invoiceId,
        amount: value.amount,
        reason: value.reason,
      };

      this.service.createCreditNote(payload).subscribe({
        next: (created) => {
          this.markAsSubmitted();
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Nota de crédito creada exitosamente',
            life: 3000,
          });
          this.router.navigate(['/finance/billing/credit-notes', created.id]);
        },
        error: (err: { error?: { message?: string } }) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err?.error?.message || 'Error al crear la nota de crédito.',
            life: 5000,
          });
        },
      });
    } else {
      this.form.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario incompleto',
        detail: this.submitTooltip() || 'Revise los campos requeridos antes de continuar.',
        life: 5000,
      });
    }
  }
}
