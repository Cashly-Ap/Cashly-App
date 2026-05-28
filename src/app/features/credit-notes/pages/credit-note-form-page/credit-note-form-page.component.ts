import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { MainLayoutComponent } from '@core/layouts/main-layout.component';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { MessageService } from 'primeng/api';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import {
  FormContainerComponent,
  FormHeaderComponent,
  FormCardComponent,
  FormActionsComponent,
} from '@core/forms/components';
import { CreditNoteApplicationService } from '../../services/application/credit-note-application.service';
import { CreditNoteCreate } from '../../models/interfaces';
import { BaseFormComponent, FormConfig } from '@core/forms/base/base-form.component';

interface CreditNoteFormData {
  customerId: string;
  customerName: string;
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  reason: string;
}

interface CustomerOption {
  id: string;
  name: string;
  rif: string;
}

interface InvoiceOption {
  id: string;
  number: string;
}

@Component({
  selector: 'app-credit-note-form-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MainLayoutComponent,
    InputTextModule,
    InputNumberModule,
    TextareaModule,
    AutoCompleteModule,
    FormContainerComponent,
    FormHeaderComponent,
    FormCardComponent,
    FormActionsComponent,
  ],
  templateUrl: './credit-note-form-page.component.html',
})
export class CreditNoteFormPageComponent extends BaseFormComponent<CreditNoteFormData> {
  private service = inject(CreditNoteApplicationService);
  private messageService = inject(MessageService);

  loading = this.service.loading;

  submitTooltip = signal('');

  filteredCustomers: CustomerOption[] = [];
  filteredInvoices: InvoiceOption[] = [];

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
      routeBase: '/credit-notes',
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
  }

  searchCustomers(event: AutoCompleteCompleteEvent): void {
    // TODO: implement customer search via API
    this.filteredCustomers = [];
  }

  searchInvoices(event: AutoCompleteCompleteEvent): void {
    // TODO: implement invoice search via API
    this.filteredInvoices = [];
  }

  onCustomerSelect(customer: CustomerOption): void {
    this.form.patchValue({
      customerId: customer.id,
      customerName: customer.name,
    });
  }

  onInvoiceSelect(invoice: InvoiceOption): void {
    this.form.patchValue({
      invoiceId: invoice.id,
      invoiceNumber: invoice.number,
    });
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
        next: () => {
          this.markAsSubmitted();
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Nota de crédito creada exitosamente',
            life: 3000,
          });
          this.router.navigate(['/credit-notes']);
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
        summary: 'Advertencia',
        detail: 'Por favor, complete todos los campos requeridos.',
        life: 5000,
      });
    }
  }
}
