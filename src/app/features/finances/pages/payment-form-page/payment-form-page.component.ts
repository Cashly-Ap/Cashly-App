import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageService } from 'primeng/api';
import { MainLayoutComponent } from '@core/layouts/main-layout.component';
import { FormContainerComponent } from '@core/forms/components/cards/form-container/form-container.component';
import { FormHeaderComponent } from '@core/forms/components/headers/form-header/form-header.component';
import { FormCardComponent } from '@core/forms/components/cards/form-card/form-card.component';
import { FormActionsComponent } from '@core/forms/components/headers/form-actions/form-actions.component';
import { CustomerList } from '@features/customers/models/interfaces';
import { CustomerPickerDialogComponent } from '@features/orders/components/customer-picker-dialog/customer-picker-dialog.component';
import { PaymentType, PAYMENT_TYPE_LABELS } from '@features/finances/models/enums';
import { FinanceApplicationService } from '@features/finances/services/application/finance-application.service';
import { PAYMENT_METHOD_TYPE_LABELS, PaymentMethodType } from '@features/finances/models/enums';

@Component({
  selector: 'app-payment-form-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    TextareaModule,
    SelectModule,
    InputTextModule,
    DatePickerModule,
    MainLayoutComponent,
    FormContainerComponent,
    FormHeaderComponent,
    FormCardComponent,
    FormActionsComponent,
    CustomerPickerDialogComponent,
  ],
  templateUrl: './payment-form-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentFormPageComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly financeService = inject(FinanceApplicationService);
  private readonly messageService = inject(MessageService);

  readonly isSubmitting = signal<boolean>(false);
  readonly selectedCustomer = signal<CustomerList | null>(null);
  readonly selectedCustomerLabel = signal<{ alias: string; legalName: string } | null>(null);
  readonly pickerVisible = signal<boolean>(false);

  readonly selectedCustomerId = computed(() => this.selectedCustomer()?.id ?? null);

  readonly submitTooltip = signal('');

  private readonly FIELD_LABELS: Record<string, string> = {
    customerId: 'Cliente',
    type: 'Tipo',
    amount: 'Monto',
    paymentMethodId: 'Método de Pago',
    paymentDate: 'Fecha de Pago',
  };

  readonly typeOptions = Object.values(PaymentType).map((pt) => ({
    label: PAYMENT_TYPE_LABELS[pt],
    value: pt,
  }));

  readonly paymentMethodOptions = Object.values(PaymentMethodType).map((pm) => ({
    label: PAYMENT_METHOD_TYPE_LABELS[pm],
    value: pm,
  }));

  readonly isAdvanceType = computed(() => this.form.value.type === PaymentType.ADVANCE);

  readonly form = this.fb.group({
    customerId: ['', [Validators.required]],
    type: [PaymentType.PAYMENT, [Validators.required]],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    paymentMethodId: ['', [Validators.required]],
    referenceNumber: [''],
    paymentDate: [new Date(), [Validators.required]],
    notes: [''],
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

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    const formValue = this.form.value;
    const paymentDate = formValue.paymentDate instanceof Date
      ? formValue.paymentDate.toISOString().split('T')[0]
      : formValue.paymentDate;

    this.financeService
      .createPayment({
        customerId: formValue.customerId ?? '',
        type: formValue.type ?? PaymentType.PAYMENT,
        amount: formValue.amount ?? 0,
        paymentMethodId: formValue.paymentMethodId ?? '',
        referenceNumber: formValue.referenceNumber ?? undefined,
        paymentDate: paymentDate ?? new Date().toISOString().split('T')[0],
        notes: formValue.notes ?? undefined,
      })
      .subscribe({
        next: (payment) => {
          this.isSubmitting.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Pago creado exitosamente',
            life: 3000,
          });
          this.router.navigate(['/finanzas', 'pagos', payment.id]);
        },
        error: () => {
          this.isSubmitting.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al crear el pago. Por favor, intente nuevamente.',
            life: 5000,
          });
        },
      });
  }

  cancel(): void {
    this.router.navigate(['/finanzas', 'pagos']);
  }
}
