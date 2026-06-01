import { Component, input, output, OnInit, inject, computed, effect, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ReceivablesApplicationService } from '../../services/application/receivables-application.service';
import { PaymentMethodApiService } from '@features/payment-methods/services/api/payment-method-api.service';
import { CustomerInvoiceDebt, PayInvoiceRequest } from '../../models/interfaces';

export type PaymentFormMode = 'single' | 'all' | 'partial';

export interface PaymentSubmitEvent {
  request: PayInvoiceRequest;
}

export interface PaymentMethodOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-payment-form-dialog',
  standalone: true,
  imports: [
    DialogModule,
    ButtonModule,
    InputNumberModule,
    DatePickerModule,
    SelectModule,
    InputTextModule,
    ReactiveFormsModule,
    CurrencyPipe,
  ],
  templateUrl: './payment-form-dialog.component.html',
})
export class PaymentFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private paymentMethodApi = inject(PaymentMethodApiService);
  protected receivablesService = inject(ReceivablesApplicationService);

  readonly visible = input.required<boolean>();
  readonly mode = input.required<PaymentFormMode>();
  readonly invoice = input<CustomerInvoiceDebt | null>(null);
  readonly customerName = input<string>('');
  readonly totalDebt = input<number>(0);

  readonly close = output<void>();
  readonly submit = output<PaymentSubmitEvent>();
  readonly submitting = output<boolean>();

  protected loading = signal(false);
  protected paymentMethods = signal<PaymentMethodOption[]>([]);

  protected form!: FormGroup;
  protected maxDate = new Date();

  protected title = computed(() => {
    switch (this.mode()) {
      case 'single':
        return `Registrar Pago - ${this.invoice()?.invoiceNumber || ''}`;
      case 'all':
        return `Pagar Toda la Deuda - ${this.customerName()}`;
      case 'partial':
        return `Pago Parcial - ${this.customerName()}`;
      default:
        return 'Registrar Pago';
    }
  });

  protected maxAmount = computed(() => {
    switch (this.mode()) {
      case 'single': {
        const inv = this.invoice();
        if (inv?.displayStatus === 'PARTIAL_PENDING_APPROVAL') {
          return inv.realBalance || 0;
        }
        return inv?.balance || 0;
      }
      case 'all':
        return this.totalDebt();
      case 'partial':
        return this.totalDebt();
      default:
        return 0;
    }
  });

  protected showAmountField = computed(() => {
    return this.mode() === 'single' || this.mode() === 'partial';
  });

  constructor() {
    effect(() => {
      const isVisible = this.visible();
      if (isVisible && this.form) {
        const currentMode = this.mode();
        const inv = this.invoice();
        const defaultAmount =
          currentMode === 'single'
            ? (inv?.balance || 0)
            : currentMode === 'partial'
              ? this.totalDebt()
              : 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const patch: Record<string, unknown> = {
          amount: defaultAmount,
          paymentDate: today,
          referenceNumber: '',
        };
        const pm = this.form.get('paymentMethodId')?.value;
        if (!pm) {
          const methods = this.paymentMethods();
          if (methods.length > 0) {
            patch['paymentMethodId'] = methods[0].value;
          }
        }
        this.form.patchValue(patch);
        this.loading.set(false);
      }
    });

    effect(() => {
      if (!this.form) return;
      const isLoading = this.loading();
      const controls = ['amount', 'paymentDate', 'paymentMethodId', 'referenceNumber'];
      controls.forEach((name) => {
        const ctrl = this.form.get(name);
        if (!ctrl) return;
        if (isLoading) {
          ctrl.disable({ emitEvent: false });
        } else {
          if (name === 'amount' && this.mode() === 'all') {
            ctrl.disable({ emitEvent: false });
            return;
          }
          ctrl.enable({ emitEvent: false });
        }
      });
    });
  }

  ngOnInit(): void {
    this.initForm();
    this.setupAmountClamp();
    this.paymentMethodApi.getAll({ active: true, size: 100 }).pipe(catchError(() => of([]))).subscribe(res => {
      const methods = res.map(pm => ({ label: pm.name, value: pm.id }));
      this.paymentMethods.set(methods);
      if (methods.length > 0 && !this.form.get('paymentMethodId')?.value) {
        this.form.patchValue({ paymentMethodId: methods[0].value });
      }
    });
  }

  protected onSubmit(): void {
    if (this.form.valid && !this.loading()) {
      this.loading.set(true);
      this.submitting.emit(true);

      const formValue = this.form.getRawValue();

      const request: PayInvoiceRequest = {
        paymentMethodId: formValue.paymentMethodId,
        referenceNumber: formValue.referenceNumber || undefined,
        paymentDate: this.formatDate(formValue.paymentDate),
      };

      if (this.mode() === 'single' || this.mode() === 'partial') {
        request.amount = formValue.amount;
      }

      this.submit.emit({ request });
    }
  }

  protected onCancel(): void {
    if (!this.loading()) {
      this.form.patchValue({ referenceNumber: '' });
      this.loading.set(false);
      this.submitting.emit(false);
      this.close.emit();
    }
  }

  protected onVisibleChange(isVisible: boolean): void {
    if (!isVisible && !this.loading()) {
      this.onCancel();
    }
  }

  private initForm(): void {
    const inv = this.invoice();
    const defaultAmount =
      this.mode() === 'single'
        ? (inv?.balance || 0)
        : this.mode() === 'partial'
          ? this.maxAmount()
          : 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.form = this.fb.group({
      amount: [defaultAmount, [Validators.required, Validators.min(0.01)]],
      paymentDate: [today, [Validators.required]],
      paymentMethodId: ['', Validators.required],
      referenceNumber: ['', [Validators.required, Validators.maxLength(100)]],
    });

    if (this.mode() === 'all') {
      this.form.get('amount')?.disable();
    }
  }

  private setupAmountClamp(): void {
    const amountCtrl = this.form.get('amount');
    if (!amountCtrl) return;

    amountCtrl.valueChanges.subscribe(value => {
      if (!this.showAmountField()) return;
      const max = this.maxAmount();
      if (value != null && max > 0 && value > max) {
        amountCtrl.patchValue(max, { emitEvent: false });
      }
    });
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
