import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { MainLayoutComponent } from '@core/layouts/main-layout.component';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageService } from 'primeng/api';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import {
  FormContainerComponent,
  FormHeaderComponent,
  FormCardComponent,
  FormActionsComponent,
} from '@core/forms/components';
import { PaymentApplicationService } from '@features/payments/services/application/payment-application.service';
import { PaymentCreate, PaymentUpdate } from '@features/payments/models/interfaces';
import { PaymentMethodApiService } from '@features/payment-methods/services/api/payment-method-api.service';
import { PaymentMethodList } from '@features/payment-methods/models/interfaces';
import { BaseFormComponent, FormConfig } from '@core/forms/base/base-form.component';

interface PaymentFormData {
  customerId: string;
  customerName: string;
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  paymentMethodId: string;
  paymentDate: string;
  referenceNumber: string;
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
    DatePickerModule,
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
  private paymentMethodApi = inject(PaymentMethodApiService);

  loading = this.service.loading;

  submitTooltip = signal('');

  filteredCustomers: CustomerOption[] = [];
  filteredInvoices: InvoiceOption[] = [];
  readonly paymentMethods = signal<PaymentMethodList[]>([]);

  private readonly FIELD_LABELS: Record<string, string> = {
    customerName: 'Cliente',
    invoiceId: 'Factura',
    amount: 'Monto',
    paymentMethodId: 'Método de pago',
    paymentDate: 'Fecha de pago',
  };

  override ngOnInit(): void {
    super.ngOnInit?.();
    this.form.statusChanges.subscribe(() => this.updateSubmitTooltip());
    this.updateSubmitTooltip();
    this.paymentMethodApi.getAll({ active: true }).subscribe({
      next: (methods) => this.paymentMethods.set(methods),
      error: () => this.paymentMethods.set([]),
    });
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
      paymentMethodId: ['', Validators.required],
      paymentDate: [new Date().toISOString().split('T')[0], Validators.required],
      referenceNumber: ['', Validators.maxLength(100)],
    });
  }

  protected override getPendingTabTitle(formData: PaymentFormData): string {
    return `Pago - ${formData.customerName || 'Nuevo'}`;
  }

  protected override restoreFormData(data: PaymentFormData): void {
    this.form.patchValue(data);
  }

  searchCustomers(event: AutoCompleteCompleteEvent): void {
    
    this.filteredCustomers = [];
  }

  searchInvoices(event: AutoCompleteCompleteEvent): void {
    
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
          referenceNumber: value.referenceNumber || undefined,
          paymentMethodId: value.paymentMethodId || undefined,
          paymentDate: value.paymentDate || undefined,
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
        this.service.payInvoice(value.invoiceId, {
          paymentMethodId: value.paymentMethodId,
          referenceNumber: value.referenceNumber || undefined,
          paymentDate: value.paymentDate,
          amount: value.amount,
        }).subscribe({
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
