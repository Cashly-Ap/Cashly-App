import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { MainLayoutComponent } from '@core/layouts/main-layout.component';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import {
  FormContainerComponent,
  FormHeaderComponent,
  FormCardComponent,
  FormActionsComponent,
} from '@core/forms/components';
import { PaymentApplicationService } from '../../services/application/payment-application.service';
import { PaymentCreate, PaymentUpdate } from '../../models/interfaces';
import { PaymentType, PAYMENT_TYPE_LABELS } from '../../models/enums';
import { BaseFormComponent, FormConfig } from '@core/forms/base/base-form.component';

interface PaymentFormData {
  customerId: string;
  customerName: string;
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  reference: string;
  paymentType: PaymentType;
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
  selector: 'app-payment-form-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MainLayoutComponent,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    AutoCompleteModule,
    FormContainerComponent,
    FormHeaderComponent,
    FormCardComponent,
    FormActionsComponent,
  ],
  templateUrl: './payment-form-page.component.html',
})
export class PaymentFormPageComponent extends BaseFormComponent<PaymentFormData> {
  private service = inject(PaymentApplicationService);
  private messageService = inject(MessageService);

  loading = this.service.loading;

  submitTooltip = signal('');

  filteredCustomers: CustomerOption[] = [];
  filteredInvoices: InvoiceOption[] = [];

  paymentTypeOptions = Object.values(PaymentType).map((type) => ({
    value: type,
    label: PAYMENT_TYPE_LABELS[type],
  }));

  private readonly FIELD_LABELS: Record<string, string> = {
    customerName: 'Cliente',
    invoiceId: 'Factura',
    amount: 'Monto',
    paymentType: 'Tipo de Pago',
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
      entityDisplayName: 'Pago',
      entityArticle: 'el',
      module: 'finances',
      routeBase: '/payments',
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
      reference: ['', Validators.maxLength(100)],
      paymentType: [PaymentType.PAYMENT, Validators.required],
    });
  }

  protected override getPendingTabTitle(formData: PaymentFormData): string {
    return `Pago - ${formData.customerName || 'Nuevo'}`;
  }

  protected override restoreFormData(data: PaymentFormData): void {
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
      const value = this.form.getRawValue() as PaymentFormData;

      if (this.isEditMode() && this.entityId()) {
        const payload: PaymentUpdate = {
          id: this.entityId()!,
          amount: value.amount,
          reference: value.reference || undefined,
          paymentType: value.paymentType,
        };

        this.service.updatePayment(this.entityId()!, payload).subscribe({
          next: () => {
            this.markAsSubmitted();
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Pago actualizado exitosamente',
              life: 3000,
            });
            this.router.navigate(['/payments']);
          },
          error: (err: { error?: { message?: string } }) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err?.error?.message || 'Error al actualizar el pago.',
              life: 5000,
            });
          },
        });
      } else {
        const payload: PaymentCreate = {
          customerId: value.customerId,
          invoiceId: value.invoiceId,
          amount: value.amount,
          reference: value.reference || undefined,
          paymentType: value.paymentType,
        };

        this.service.createPayment(payload).subscribe({
          next: () => {
            this.markAsSubmitted();
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Pago creado exitosamente',
              life: 3000,
            });
            this.router.navigate(['/payments']);
          },
          error: (err: { error?: { message?: string } }) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err?.error?.message || 'Error al crear el pago.',
              life: 5000,
            });
          },
        });
      }
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
