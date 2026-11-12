import { StatusVariant } from '@shared/models/status-variant';
import { LanguageService } from '@core/i18n/language.service';
import { UserPreferencesService } from '@core/preferences/user-preferences.service';
import {
  PayableTone,
  payableAmountClass,
  purchaseStatusTranslationKey,
  purchaseStatusVariant,
  isPurchaseOverdue,
} from '@features/finance/treasury/payables/components/payables-presentation';
import { TranslateOptionsPipe } from '@core/i18n/translate-options.pipe';
import { LocalizedDatePipe, LocalizedCurrencyPipe } from '@core/i18n/localized-format.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { PermissionDirective } from '@features/platform/auth/authorization/directives/permission.directive';
import {
  ListActionButtonsComponent,
  ListAction,
} from '@shared/components/list/list-action-buttons/list-action-buttons.component';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  inject,
  signal,
  computed,
  effect,
} from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TextBadgeComponent } from '@shared/components/ui/text-badge/text-badge.component';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { MessageService } from 'primeng/api';
import { of, catchError } from 'rxjs';
import { PaymentMethodApiService } from '@features/finance/treasury/payment-methods/services/api/payment-method-api.service';
import { SupplierBalanceApiService } from '@features/partners/suppliers/services/api/supplier-balance-api.service';
import { SupplierBalanceTransactionResponse } from '@features/partners/suppliers/models/interfaces/supplier-balance-transaction.interface';
import { PayablesApplicationService } from '@features/finance/treasury/payables/services/application/payables-application.service';
import { PayablesSearchParams } from '@features/finance/treasury/payables/services/api/payables-api.service';
import { SupplierPurchaseDebt } from '@features/finance/treasury/payables/models/interfaces/supplier-purchase-debt.interface';
import { PanelCardComponent } from '@shared/components/ui/panel-card/panel-card.component';
import { listAction } from '@shared/components/list/list-action-builders';
import { PaginatorComponent } from '@shared/components/ui/paginator/paginator.component';
import { CancelButtonComponent } from '@shared/components/ui/cancel-button/cancel-button.component';
import {
  BalanceMovementDialogComponent,
  BalanceMovementSubmit,
} from '@shared/components/ui/balance-movement-dialog/balance-movement-dialog.component';

type PurchaseStatusFilter =
  | 'ALL'
  | 'CONFIRMED'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'OVERDUE'
  | 'CANCELLED';

interface StatusFilterOption {
  label: string;
  value: PurchaseStatusFilter;
}

@Component({
  selector: 'app-supplier-debt-dialog',
  standalone: true,
  imports: [
    PaginatorComponent,
    PanelCardComponent,
    TranslateOptionsPipe,
    TranslatePipe,
    LocalizedDatePipe,
    LocalizedCurrencyPipe,
    TextBadgeComponent,
    PermissionDirective,
    ListActionButtonsComponent,
    DialogModule,
    ButtonModule,
    TableModule,
    SelectModule,
    InputNumberModule,
    TextareaModule,
    FormsModule,
    ReactiveFormsModule,
    CancelButtonComponent,
    BalanceMovementDialogComponent,
  ],
  templateUrl: './supplier-debt-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupplierDebtDialogComponent {
  readonly locale = inject(LanguageService).locale;
  private readonly preferences = inject(UserPreferencesService);
  private readonly fb = inject(FormBuilder);
  private readonly messages = inject(MessageService);
  private readonly paymentMethodApi = inject(PaymentMethodApiService);
  private readonly balanceApi = inject(SupplierBalanceApiService);
  protected readonly service = inject(PayablesApplicationService);

  readonly visible = input.required<boolean>();
  readonly supplierId = input.required<string>();

  readonly close = output<void>();
  readonly payPurchase = output<SupplierPurchaseDebt>();
  readonly payAll = output<void>();
  readonly payPartial = output<void>();
  readonly viewPurchasePaymentHistory = output<SupplierPurchaseDebt>();
  readonly balanceChanged = output<void>();

  protected readonly supplier = computed(() => this.service.currentSupplier());
  protected readonly purchases = computed(() => this.service.supplierPurchases());
  protected readonly loading = computed(() => this.service.loading());

  protected readonly initialLoadComplete = signal(false);
  protected readonly loadingPurchases = signal(false);
  protected readonly selectedStatusFilter = signal<PurchaseStatusFilter>('ALL');
  protected readonly todayDate = new Date().toISOString().slice(0, 10);

  protected readonly showAdvanceDialog = signal(false);
  protected readonly showRefundDialog = signal(false);
  protected readonly creatingAdvance = signal(false);
  protected readonly creatingRefund = signal(false);
  protected readonly paymentMethods = signal<{ label: string; value: string }[]>([]);
  protected readonly currentBalance = signal<number>(0);
  protected readonly allBalanceTransactions = signal<SupplierBalanceTransactionResponse[]>([]);
  protected readonly loadingBalance = signal(false);
  protected readonly balanceFilterType = signal<string>('ALL');
  protected readonly balanceFirst = signal(0);
  protected readonly balanceRows = signal(10);

  protected readonly balanceFilterOptions = [
    { label: 'finance.treasury.paymentmethods.all', value: 'ALL' },
    { label: 'partners.suppliers.balanceAdvanced', value: 'ADVANCED' },
    { label: 'partners.suppliers.balanceReturns', value: 'RETURNS' },
    { label: 'partners.suppliers.balancePayments', value: 'PAYMENTS' },
    { label: 'partners.suppliers.balancePurchases', value: 'INVOICES' },
    { label: 'partners.suppliers.balanceRefund', value: 'REFUND' },
    { label: 'partners.suppliers.balanceCreditNote', value: 'CREDIT_NOTE' },
    { label: 'partners.suppliers.balanceDebitNote', value: 'DEBIT_NOTE' },
  ];

  protected readonly filteredBalanceTransactions = computed(() => {
    const filter = this.balanceFilterType();
    return filter === 'ALL'
      ? this.allBalanceTransactions()
      : this.allBalanceTransactions().filter((transaction) => transaction.type === filter);
  });

  protected readonly balanceTotalRecords = computed(
    () => this.filteredBalanceTransactions().length,
  );

  protected readonly balanceTransactions = computed(() => {
    const first = this.balanceFirst() * this.balanceRows();
    return this.filteredBalanceTransactions().slice(first, first + this.balanceRows());
  });

  protected readonly advanceForm: FormGroup = this.fb.group({
    amount: [null, [Validators.required, Validators.min(0.01)]],
    paymentMethodId: [null, Validators.required],
    notes: [''],
  });

  protected readonly refundForm: FormGroup = this.fb.group({
    amount: [null, [Validators.required, Validators.min(0.01)]],
    paymentMethodId: [null, Validators.required],
    notes: [''],
  });

  protected readonly purchaseFirst = signal(0);
  protected readonly purchaseRows = signal(10);
  protected readonly purchaseTotalRecords = signal(0);

  protected readonly statusFilterOptions: StatusFilterOption[] = [
    { label: 'finance.treasury.payables.allStatuses', value: 'ALL' },
    { label: 'finance.treasury.payables.statusConfirmed', value: 'CONFIRMED' },
    { label: 'finance.treasury.payables.statusPartiallyPaid', value: 'PARTIALLY_PAID' },
    { label: 'finance.treasury.payables.statusPaid', value: 'PAID' },
    { label: 'finance.treasury.payables.statusOverdue', value: 'OVERDUE' },
    { label: 'finance.treasury.payables.statusCancelled', value: 'CANCELLED' },
  ];

  constructor() {
    this.loadPaymentMethods();
    effect(() => {
      const isVisible = this.visible();
      const id = this.supplierId();
      if (!isVisible || !id) return;
      this.loadSupplierData(id);
      this.loadBalanceData(id);
    });
  }

  protected onClose(): void {
    this.service.clearCurrentSupplier();
    this.close.emit();
  }

  protected onVisibleChange(isVisible: boolean): void {
    if (!isVisible) {
      this.onClose();
    }
  }

  refreshVisibleDetails(): void {
    if (this.visible() && this.supplierId()) {
      this.loadSupplierData(this.supplierId());
      this.loadBalanceData(this.supplierId());
    }
  }

  protected purchaseActions(purchase: SupplierPurchaseDebt): ListAction[] {
    const actions: ListAction[] = [
      listAction('Ver historial de pagos', 'READ', 'history', () =>
        this.onViewPurchasePaymentHistory(purchase),
      ),
    ];
    if (purchase.balance > 0) {
      actions.push(
        listAction('Registrar pago', 'EXECUTE', 'dollar', () => this.onPayPurchase(purchase)),
      );
    }
    return actions;
  }

  protected onPayPurchase(purchase: SupplierPurchaseDebt): void {
    this.payPurchase.emit(purchase);
  }

  protected onPayAll(): void {
    this.payAll.emit();
  }

  protected onPayPartial(): void {
    this.payPartial.emit();
  }

  protected onViewPurchasePaymentHistory(purchase: SupplierPurchaseDebt): void {
    this.viewPurchasePaymentHistory.emit(purchase);
  }

  protected onStatusFilterChange(filter: PurchaseStatusFilter): void {
    this.selectedStatusFilter.set(filter);
    this.purchaseFirst.set(0);
    this.loadPurchasesForCurrentFilter();
  }

  protected onPurchasePageChange(event: { first?: number; rows?: number }): void {
    this.purchaseFirst.set(event.first ?? 0);
    this.purchaseRows.set(event.rows ?? 10);
    this.loadPurchasesForCurrentFilter();
  }

  protected getStatusLabel(status: string): string {
    return purchaseStatusTranslationKey(status);
  }

  protected getStatusVariant(status: string): StatusVariant {
    return purchaseStatusVariant(status);
  }

  protected amountColor(tone: PayableTone): string {
    return payableAmountClass(this.preferences.colorMode() === 'informative', tone);
  }

  protected isOverdue(purchase: SupplierPurchaseDebt): boolean {
    return isPurchaseOverdue(purchase, this.todayDate);
  }

  openBalanceAction(action: 'advance' | 'refund'): void {
    if (action === 'advance') this.onCreateAdvance();
    else this.onCreateRefund();
  }

  protected onCreateAdvance(): void {
    this.advanceForm.reset({
      amount: null,
      paymentMethodId: this.defaultPaymentMethod(),
      notes: '',
    });
    this.showAdvanceDialog.set(true);
  }

  protected onCreateRefund(): void {
    const maxRefund = Math.max(this.currentBalance() || this.supplier()?.supplierBalance || 0, 0);
    const amountControl = this.refundForm.get('amount');
    amountControl?.setValidators([
      Validators.required,
      Validators.min(0.01),
      Validators.max(maxRefund),
    ]);
    amountControl?.updateValueAndValidity();
    this.refundForm.reset({
      amount: maxRefund > 0 ? maxRefund : null,
      paymentMethodId: this.defaultPaymentMethod(),
      notes: '',
    });
    this.showRefundDialog.set(true);
  }

  protected onCancelAdvance(): void {
    this.showAdvanceDialog.set(false);
    this.advanceForm.reset();
  }

  protected onCancelRefund(): void {
    this.showRefundDialog.set(false);
    this.refundForm.reset();
  }

  protected onAdvanceVisibleChange(visible: boolean): void {
    this.showAdvanceDialog.set(visible);
    if (!visible) this.advanceForm.reset();
  }

  protected onRefundVisibleChange(visible: boolean): void {
    this.showRefundDialog.set(visible);
    if (!visible) this.refundForm.reset();
  }

  protected onAdvanceSubmitted(event: BalanceMovementSubmit): void {
    this.creatingAdvance.set(true);
    this.balanceApi
      .createAdvance(this.supplierId(), {
        amount: event.amount,
        paymentMethodId: event.paymentMethodId,
        notes: event.notes,
      })
      .subscribe({
        next: () => {
          this.showAdvanceDialog.set(false);
          this.creatingAdvance.set(false);
          this.messages.add({
            severity: 'success',
            summary: 'finance.treasury.payables.advanceRecorded',
            detail: `Se agregaron $${Number(event.amount).toFixed(2)} al saldo a favor del proveedor`,
            life: 8000,
          });
          this.refreshAfterBalanceAction();
        },
        error: () => {
          this.creatingAdvance.set(false);
          this.messages.add({
            severity: 'error',
            summary: 'Error',
            detail: 'finance.treasury.payables.advanceFailed',
            life: 8000,
          });
        },
      });
  }

  protected legacySubmitAdvance(): void {
    if (this.advanceForm.invalid) {
      this.advanceForm.markAllAsTouched();
      this.messages.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Complete el monto y el método de pago para registrar el anticipo',
        life: 8000,
      });
      return;
    }
    const value = this.advanceForm.getRawValue();
    this.creatingAdvance.set(true);
    this.balanceApi
      .createAdvance(this.supplierId(), {
        amount: value.amount,
        paymentMethodId: value.paymentMethodId,
        notes: value.notes || undefined,
      })
      .subscribe({
        next: () => {
          this.showAdvanceDialog.set(false);
          this.creatingAdvance.set(false);
          this.messages.add({
            severity: 'success',
            summary: 'Anticipo registrado',
            detail: `Se agregaron ${this.formatMoney(value.amount)} al saldo a favor del proveedor`,
          });
          this.refreshAfterBalanceAction();
        },
        error: () => {
          this.creatingAdvance.set(false);
          this.messages.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo registrar el anticipo',
          });
        },
      });
  }

  protected onRefundSubmitted(event: BalanceMovementSubmit): void {
    this.creatingRefund.set(true);
    this.balanceApi
      .createRefund(this.supplierId(), {
        amount: event.amount,
        paymentMethodId: event.paymentMethodId,
        notes: event.notes,
      })
      .subscribe({
        next: () => {
          this.showRefundDialog.set(false);
          this.creatingRefund.set(false);
          this.messages.add({
            severity: 'success',
            summary: 'finance.treasury.payables.refundRecorded',
            detail: `Se reintegraron $${Number(event.amount).toFixed(2)} del saldo a favor`,
            life: 8000,
          });
          this.refreshAfterBalanceAction();
        },
        error: () => {
          this.creatingRefund.set(false);
          this.messages.add({
            severity: 'error',
            summary: 'Error',
            detail: 'finance.treasury.payables.refundFailed',
            life: 8000,
          });
        },
      });
  }

  protected legacySubmitRefund(): void {
    if (this.refundForm.invalid) {
      this.refundForm.markAllAsTouched();
      this.messages.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Complete el monto y el método de pago para realizar el reintegro',
        life: 8000,
      });
      return;
    }
    const value = this.refundForm.getRawValue();
    if (value.amount > this.currentBalance()) return;
    this.creatingRefund.set(true);
    this.balanceApi
      .createRefund(this.supplierId(), {
        amount: value.amount,
        paymentMethodId: value.paymentMethodId,
        notes: value.notes || undefined,
      })
      .subscribe({
        next: () => {
          this.showRefundDialog.set(false);
          this.creatingRefund.set(false);
          this.messages.add({
            severity: 'success',
            summary: 'Reintegro realizado',
            detail: `Se reintegraron ${this.formatMoney(value.amount)} del saldo a favor`,
          });
          this.refreshAfterBalanceAction();
        },
        error: () => {
          this.creatingRefund.set(false);
          this.messages.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo realizar el reintegro',
          });
        },
      });
  }

  private refreshAfterBalanceAction(): void {
    this.service.loadSupplierDebt(this.supplierId()).subscribe();
    this.loadBalanceData(this.supplierId());
    this.service.supplierDebtChange.next();
    this.balanceChanged.emit();
  }

  private loadPaymentMethods(): void {
    this.paymentMethodApi
      .getAll({ active: true, size: 100 })
      .pipe(catchError(() => of({ content: [] })))
      .subscribe((response) => {
        this.paymentMethods.set(
          (response.content ?? []).map((method) => ({ label: method.name, value: method.id })),
        );
      });
  }

  private defaultPaymentMethod(): string | null {
    return this.paymentMethods()[0]?.value ?? null;
  }

  private formatMoney(value: number): string {
    return `$${Number(value).toFixed(2)}`;
  }

  protected onBalanceFilterChange(filter: string): void {
    this.balanceFilterType.set(filter);
    this.balanceFirst.set(0);
  }

  protected onBalancePageChange(event: { first: number; rows: number }): void {
    this.balanceRows.set(event.rows ?? 10);
    this.balanceFirst.set(Math.floor((event.first ?? 0) / (event.rows ?? 10)));
  }

  protected getBalanceTypeLabel(type: string): string {
    const keys: Record<string, string> = {
      ADVANCED: 'partners.suppliers.balanceAdvanced',
      RETURNS: 'partners.suppliers.balanceReturns',
      PAYMENTS: 'partners.suppliers.balancePayments',
      INVOICES: 'partners.suppliers.balancePurchases',
      REFUND: 'partners.suppliers.balanceRefund',
      CREDIT_NOTE: 'partners.suppliers.balanceCreditNote',
      DEBIT_NOTE: 'partners.suppliers.balanceDebitNote',
    };
    return keys[type] ?? type;
  }

  protected isPositiveBalance(type: string): boolean {
    return ['ADVANCED', 'RETURNS', 'PAYMENTS', 'CREDIT_NOTE'].includes(type);
  }

  private loadBalanceData(supplierId: string): void {
    this.loadingBalance.set(true);
    this.balanceApi.getBalance(supplierId).subscribe({
      next: (balance) => this.currentBalance.set(balance.totalBalance),
      error: () => this.currentBalance.set(0),
    });
    this.balanceApi.getTransactions(supplierId, 0, 1000).subscribe({
      next: (response) => {
        this.allBalanceTransactions.set(response.content ?? []);
        this.loadingBalance.set(false);
      },
      error: () => {
        this.allBalanceTransactions.set([]);
        this.loadingBalance.set(false);
      },
    });
  }

  private loadSupplierData(supplierId: string): void {
    this.service.loadSupplierDebt(supplierId).subscribe();
    this.loadPurchases(supplierId, 'ALL', true);
  }

  private loadPurchasesForCurrentFilter(): void {
    const id = this.supplierId();
    if (id) {
      this.loadPurchases(id, this.selectedStatusFilter());
    }
  }

  private loadPurchases(
    supplierId: string,
    status: PurchaseStatusFilter,
    isInitialLoad = false,
  ): void {
    this.loadingPurchases.set(true);
    const first = this.purchaseFirst();
    const rows = this.purchaseRows();

    const params: PayablesSearchParams = {
      page: Math.floor(first / rows),
      size: rows,
    };
    if (status !== 'ALL') {
      params.status = status;
    }

    this.service.loadSupplierPurchases(supplierId, params).subscribe({
      next: () => {
        this.purchaseTotalRecords.set(this.service.totalSupplierPurchases());
        this.loadingPurchases.set(false);
        if (isInitialLoad) {
          this.initialLoadComplete.set(true);
        }
      },
      error: () => {
        this.loadingPurchases.set(false);
        if (isInitialLoad) {
          this.initialLoadComplete.set(true);
        }
      },
    });
  }
}
