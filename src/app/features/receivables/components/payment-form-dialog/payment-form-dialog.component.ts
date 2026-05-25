import { Component, input, output, OnInit, inject, computed, effect, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { ReceivablesApplicationService } from '../../services/application/receivables-application.service';
import { CustomerInvoiceDebt, PayInvoiceRequest } from '../../models/interfaces';

export type PaymentFormMode = 'single' | 'all' | 'partial';

export interface PaymentSubmitEvent {
  request: PayInvoiceRequest;
  voucherFile?: File;
}

interface PaymentMethodOption {
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
  protected selectedFile = signal<File | null>(null);
  protected fileError = signal<string | null>(null);

  protected form!: FormGroup;
  protected maxDate = new Date();

  protected readonly paymentMethods: PaymentMethodOption[] = [
    { label: 'Transferencia', value: 'TRANSFER' },
    { label: 'Efectivo', value: 'CASH' },
    { label: 'Cheque', value: 'CHECK' },
    { label: 'Tarjeta de Débito', value: 'DEBIT_CARD' },
    { label: 'Tarjeta de Crédito', value: 'CREDIT_CARD' },
    { label: 'Depósito', value: 'DEPOSIT' },
    { label: 'Otro', value: 'OTHER' },
  ];

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
      const currentMaxAmount = this.maxAmount();
      const currentMode = this.mode();

      if (isVisible && this.form) {
        const inv = this.invoice();
        const defaultAmount =
          currentMode === 'single'
            ? (inv?.displayStatus === 'PARTIAL_PENDING_APPROVAL' ? inv.realBalance || 0 : inv?.balance || 0)
            : currentMode === 'partial'
              ? this.totalDebt()
              : 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        this.form.patchValue({
          amount: defaultAmount,
          paymentDate: today,
          paymentMethodId: 'TRANSFER',
          referenceNumber: '',
        });
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
          if (name === 'amount' && this.mode() === 'all') return;
          ctrl.enable({ emitEvent: false });
        }
      });
    });
  }

  ngOnInit(): void {
    this.initForm();
  }

  protected onSubmit(): void {
    if (this.form.valid && !this.loading()) {
      this.loading.set(true);
      this.submitting.emit(true);

      const formValue = this.form.getRawValue();

      const isMerchant = this.receivablesService.isMerchant();
      if (isMerchant && !this.selectedFile()) {
        this.fileError.set('El comprobante de pago es requerido');
        this.loading.set(false);
        return;
      }

      const request: PayInvoiceRequest = {
        paymentMethodId: formValue.paymentMethodId,
        referenceNumber: formValue.referenceNumber || undefined,
        paymentDate: this.formatDate(formValue.paymentDate),
      };

      if (this.mode() === 'single' || this.mode() === 'partial') {
        request.amount = formValue.amount;
      }

      const event: PaymentSubmitEvent = {
        request,
        ...(this.selectedFile() ? { voucherFile: this.selectedFile()! } : {}),
      };

      this.submit.emit(event);
    }
  }

  protected onCancel(): void {
    if (!this.loading()) {
      this.form.reset();
      this.loading.set(false);
      this.selectedFile.set(null);
      this.fileError.set(null);
      this.submitting.emit(false);
      this.close.emit();
    }
  }

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (file) {
      const maxSize = 10 * 1024 * 1024; 
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];

      if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|jpg|jpeg|png)$/i)) {
        this.fileError.set('Formato no válido. Use PDF, JPG o PNG.');
        this.selectedFile.set(null);
        return;
      }

      if (file.size > maxSize) {
        this.fileError.set('El archivo no puede superar los 10MB.');
        this.selectedFile.set(null);
        return;
      }

      this.selectedFile.set(file);
      this.fileError.set(null);
    }
  }

  protected onVisibleChange(isVisible: boolean): void {
    if (!isVisible && !this.loading()) {
      this.selectedFile.set(null);
      this.fileError.set(null);
      this.onCancel();
    }
  }

  private initForm(): void {
    const inv = this.invoice();
    const defaultAmount =
      this.mode() === 'single'
        ? (inv?.displayStatus === 'PARTIAL_PENDING_APPROVAL' ? inv.realBalance || 0 : inv?.balance || 0)
        : this.mode() === 'partial'
          ? this.maxAmount()
          : 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.form = this.fb.group({
      amount: [defaultAmount, [Validators.required, Validators.min(0.01)]],
      paymentDate: [today, [Validators.required]],
      paymentMethodId: ['TRANSFER', Validators.required],
      referenceNumber: ['', [Validators.required, Validators.maxLength(100)]],
    });

    if (this.mode() === 'all') {
      this.form.get('amount')?.disable();
    }
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
