import { LanguageService } from '@core/i18n/language.service';
import { TranslationService } from '@core/i18n/translation.service';
import { LocalizedCurrencyPipe } from '@core/i18n/localized-format.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Component, input, output, OnInit, inject, computed, effect, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormsModule,
} from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PaymentMethodApiService } from '@features/finance/treasury/payment-methods/services/api/payment-method-api.service';
import { PaymentMethodList } from '@features/finance/treasury/payment-methods/models/interfaces/payment-method.interface';
import { PagedResponse } from '@shared/models/interfaces/paged-response.interface';
import { SupplierPurchaseDebt } from '@features/finance/treasury/payables/models/interfaces/supplier-purchase-debt.interface';
import { PayPurchaseRequest } from '@features/finance/treasury/payables/models/interfaces/payment-request.interface';
import { CancelButtonComponent } from '@shared/components/ui/cancel-button/cancel-button.component';
import { SubmitButtonComponent } from '@shared/components/ui/submit-button/submit-button.component';

export type PaymentFormMode = 'single' | 'all' | 'partial' | 'validation';

export interface PaymentSubmitEvent {
  request: PayPurchaseRequest;
}

export interface PaymentMethodOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-supplier-payment-form-dialog',
  standalone: true,
  imports: [
    SubmitButtonComponent,
    CancelButtonComponent,
    TranslatePipe,
    LocalizedCurrencyPipe,
    DialogModule,
    ButtonModule,
    InputNumberModule,
    DatePickerModule,
    SelectModule,
    InputTextModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './supplier-payment-form-dialog.component.html',
})
export class SupplierPaymentFormDialogComponent implements OnInit {
  readonly locale = inject(LanguageService).locale;

  private readonly fb = inject(FormBuilder);
  private readonly paymentMethodApi = inject(PaymentMethodApiService);
  private readonly translations = inject(TranslationService);

  readonly visible = input.required<boolean>();
  readonly mode = input.required<PaymentFormMode>();
  readonly purchase = input<SupplierPurchaseDebt | null>(null);
  readonly supplierName = input<string>('');
  readonly totalDebt = input<number>(0);

  readonly close = output<void>();
  readonly submit = output<PaymentSubmitEvent>();
  readonly submitting = output<boolean>();

  protected readonly loading = signal(false);
  protected readonly paymentMethods = signal<PaymentMethodOption[]>([]);
  protected readonly maxDate = new Date();

  protected form!: FormGroup;

  protected readonly title = computed(() => {
    switch (this.mode()) {
      case 'single':
        return this.translations.t('finance.treasury.payables.paymentForPurchase', {
          number: this.purchase()?.purchaseNumber || '',
        });
      case 'all':
        return this.translations.t('finance.treasury.payables.paySupplierDebt', {
          supplier: this.supplierName(),
        });
      case 'partial':
        return this.translations.t('finance.treasury.payables.partialPaymentForSupplier', {
          supplier: this.supplierName(),
        });
      case 'validation':
        return this.translations.t('finance.treasury.payables.paymentWithValidationForSupplier', {
          supplier: this.supplierName(),
        });
      default:
        return 'Registrar Pago';
    }
  });

  protected readonly maxAmount = computed(() => {
    switch (this.mode()) {
      case 'single':
        return this.purchase()?.balance ?? 0;
      default:
        return this.totalDebt();
    }
  });

  protected readonly showAmountField = computed(
    () => this.mode() === 'single' || this.mode() === 'partial' || this.mode() === 'validation',
  );

  constructor() {
    effect(() => {
      if (!this.visible() || !this.form) return;

      const mode = this.mode();
      const purchase = this.purchase();
      const defaultAmount =
        mode === 'single' ? (purchase?.balance ?? 0) : mode === 'all' ? 0 : this.totalDebt();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const methods = this.paymentMethods();

      this.form.patchValue({
        amount: defaultAmount,
        paymentDate: today,
        referenceNumber: '',
        notes: '',
        paymentMethodId: this.form.get('paymentMethodId')?.value || methods[0]?.value || '',
      });
      this.loading.set(false);
    });

    effect(() => {
      if (!this.form) return;
      const amount = this.form.get('amount');
      if (!amount) return;
      if (this.loading() || this.mode() === 'all') {
        amount.disable({ emitEvent: false });
        return;
      }
      amount.enable({ emitEvent: false });
    });
  }

  ngOnInit(): void {
    this.initForm();
    this.setupAmountClamp();
    this.paymentMethodApi
      .getAll({ active: true, size: 100 })
      .pipe(
        catchError(() => {
          const empty: PagedResponse<PaymentMethodList> = {
            content: [],
            totalElements: 0,
            totalPages: 0,
            size: 0,
            number: 0,
            first: true,
            last: true,
            empty: true,
          };
          return of(empty);
        }),
      )
      .subscribe((res) => {
        const methods = res.content.map((method) => ({ label: method.name, value: method.id }));
        this.paymentMethods.set(methods);
        if (methods.length > 0 && !this.form.get('paymentMethodId')?.value) {
          this.form.patchValue({ paymentMethodId: methods[0].value });
        }
      });
  }

  protected onSubmit(): void {
    if (!this.form.valid || this.loading()) return;

    this.loading.set(true);
    this.submitting.emit(true);

    const value = this.form.getRawValue();
    const request: PayPurchaseRequest = {
      paymentMethodId: value.paymentMethodId,
      amount: value.amount,
      referenceNumber: value.referenceNumber || undefined,
      paymentDate: this.formatDate(value.paymentDate),
      notes: value.notes || undefined,
    };

    if (this.mode() === 'all') {
      request.amount = this.totalDebt();
    }

    this.submit.emit({ request });
  }

  protected onCancel(): void {
    if (this.loading()) return;
    this.form.patchValue({ referenceNumber: '', notes: '' });
    this.loading.set(false);
    this.submitting.emit(false);
    this.close.emit();
  }

  protected onVisibleChange(isVisible: boolean): void {
    if (!isVisible && !this.loading()) {
      this.onCancel();
    }
  }

  private initForm(): void {
    const defaultAmount =
      this.mode() === 'single' ? (this.purchase()?.balance ?? 0) : this.totalDebt();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.form = this.fb.group({
      amount: [defaultAmount, [Validators.required, Validators.min(0.01)]],
      paymentDate: [today, [Validators.required]],
      paymentMethodId: ['', Validators.required],
      referenceNumber: ['', [Validators.required, Validators.maxLength(100)]],
      notes: [''],
    });

    if (this.mode() === 'all') {
      this.form.get('amount')?.disable();
    }
  }

  private setupAmountClamp(): void {
    const amountCtrl = this.form.get('amount');
    if (!amountCtrl) return;

    amountCtrl.valueChanges.subscribe((value) => {
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
