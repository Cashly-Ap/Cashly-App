import { LocalizedCurrencyPipe } from '@core/i18n/localized-format.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import {
  ListActionButtonsComponent,
  ListAction,
} from '@shared/components/list/list-action-buttons/list-action-buttons.component';
import {
  Component,
  viewChild,
  inject,
  OnInit,
  OnDestroy,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, finalize } from 'rxjs';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { PayablesApplicationService } from '@features/finance/treasury/payables/services/application/payables-application.service';
import { PayablesSearchParams } from '@features/finance/treasury/payables/services/api/payables-api.service';
import { SupplierDebtList } from '@features/finance/treasury/payables/models/interfaces/supplier-debt-list.interface';
import { SupplierPurchaseDebt } from '@features/finance/treasury/payables/models/interfaces/supplier-purchase-debt.interface';
import { SupplierDebtDialogComponent } from '@features/finance/treasury/payables/components/supplier-debt-dialog/supplier-debt-dialog.component';
import { SupplierPaymentFormDialogComponent } from '@features/finance/treasury/payables/components/supplier-payment-form-dialog/supplier-payment-form-dialog.component';
import {
  PaymentFormMode,
  PaymentSubmitEvent,
} from '@features/finance/treasury/payables/components/supplier-payment-form-dialog/supplier-payment-form-dialog.component';
import { PaymentHistoryDialogComponent } from '@features/finance/treasury/payables/components/payment-history-dialog/payment-history-dialog.component';
import { PendingSupplierPaymentsTabComponent } from '@features/finance/treasury/payables/components/pending-supplier-payments-tab/pending-supplier-payments-tab.component';
import { PayPartialDebtRequest } from '@features/finance/treasury/payables/models/interfaces/payment-request.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchFieldComponent } from '@shared/components/ui/search-field/search-field.component';
import { PanelCardComponent } from '@shared/components/ui/panel-card/panel-card.component';
import { listAction } from '@shared/components/list/list-action-builders';
import { MetricCardComponent } from '@shared/components/ui/metric-card/metric-card.component';
import { PageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';
import { PaginatorComponent } from '@shared/components/ui/paginator/paginator.component';
import { MetricSkeletonComponent } from '@shared/components/ui/skeletons/metric-skeleton.component';
import { ListRowSkeletonComponent } from '@shared/components/ui/skeletons/list-row-skeleton.component';

@Component({
  selector: 'app-payables-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MetricSkeletonComponent,
    ListRowSkeletonComponent,
    PaginatorComponent,
    PageHeaderComponent,
    MetricCardComponent,
    PanelCardComponent,
    TranslatePipe,
    LocalizedCurrencyPipe,
    ListActionButtonsComponent,
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    SkeletonModule,
    SupplierDebtDialogComponent,
    SupplierPaymentFormDialogComponent,
    PaymentHistoryDialogComponent,
    PendingSupplierPaymentsTabComponent,
    SearchFieldComponent,
  ],
  templateUrl: './payables-page.component.html',
})
export class PayablesPageComponent implements OnInit, OnDestroy {
  readonly service = inject(PayablesApplicationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly destroy$ = new Subject<void>();
  readonly searchTerm = signal('');
  readonly first = signal(0);
  readonly rows = signal(10);
  readonly sortField = signal<string>('');
  readonly sortOrder = signal<number>(0);

  readonly supplierDebtVisible = signal(false);
  readonly selectedSupplier = signal<SupplierDebtList | null>(null);

  readonly paymentFormVisible = signal(false);
  readonly paymentFormMode = signal<PaymentFormMode>('single');
  readonly paymentPurchase = signal<SupplierPurchaseDebt | null>(null);
  readonly paymentSupplierName = signal('');
  readonly paymentTotalDebt = signal(0);
  readonly paymentSubmitting = signal(false);

  readonly activeTab = signal<string>('suppliers');
  readonly focusPaymentId = signal<string | null>(null);

  readonly paymentHistoryVisible = signal(false);
  readonly paymentHistorySupplierId = signal('');
  readonly paymentHistoryPurchaseId = signal<string | null>(null);

  readonly todayDate = new Date().toISOString().slice(0, 10);

  readonly showInitialLoading = computed(
    () => this.service.loading() && this.service.suppliers().length === 0,
  );

  readonly isEmpty = computed(
    () => !this.service.loading() && this.service.totalSuppliers() === 0 && !this.searchTerm(),
  );

  readonly hasFilteredResults = computed(
    () => !this.service.loading() && this.service.totalSuppliers() === 0 && !!this.searchTerm(),
  );

  ngOnInit(): void {
    this.route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const requestedTab = params.get('tab');
      const focusPaymentId = params.get('focus');
      if (requestedTab === 'pending' || focusPaymentId) {
        this.activeTab.set('pending');
      }
      this.focusPaymentId.set(focusPaymentId);
    });

    this.service.loadGlobalSummary().pipe(takeUntil(this.destroy$)).subscribe();
    this.loadSuppliers();

    this.service.supplierDebtChange.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.service.loadGlobalSummary().pipe(takeUntil(this.destroy$)).subscribe();
      this.loadSuppliers();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onPaymentFocusHandled(paymentId: string): void {
    if (this.focusPaymentId() !== paymentId) return;
    this.focusPaymentId.set(null);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { focus: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  onPaymentValidated(): void {
    this.service.supplierDebtChange.next();
  }

  onSearch(value: string): void {
    this.searchTerm.set(value);
    this.first.set(0);
    this.loadSuppliers();
  }

  onPageChange(event: { first: number; rows: number }): void {
    this.first.set(event.first ?? 0);
    this.rows.set(event.rows ?? 10);
    this.loadSuppliers();
  }

  toggleSort(field: string): void {
    if (this.sortField() === field) {
      const nextOrder = this.sortOrder() === 0 ? 1 : this.sortOrder() === 1 ? -1 : 0;
      this.sortOrder.set(nextOrder);
      if (nextOrder === 0) this.sortField.set('');
    } else {
      this.sortField.set(field);
      this.sortOrder.set(1);
    }
    this.first.set(0);
    this.loadSuppliers();
  }

  sortIcon(field: string): string {
    if (this.sortField() !== field) return 'pi pi-fw pi-sort-alt text-surface-400';
    return this.sortOrder() === 1
      ? 'pi pi-fw pi-sort-up font-bold text-surface-900 dark:text-surface-0'
      : 'pi pi-fw pi-sort-down font-bold text-surface-900 dark:text-surface-0';
  }

  private readonly debtDialog = viewChild.required(SupplierDebtDialogComponent);

  supplierActions(supplier: SupplierDebtList): ListAction[] {
    return [
      listAction('Ver deuda', 'READ', 'eye', () => this.onViewSupplierDebt(supplier)),
      listAction(
        'Pagar todo',
        'EXECUTE',
        'check-circle',
        () => this.openSupplierPayment(supplier, 'all'),
        { disabled: supplier.totalDebt <= 0 },
      ),
      listAction(
        'Pago parcial',
        'EXECUTE',
        'percentage',
        () => this.openSupplierPayment(supplier, 'partial'),
        { disabled: supplier.totalDebt <= 0 },
      ),
      listAction(
        'Pagar con validación',
        'PAY_WITH_VALIDATION',
        'shield',
        () => this.openSupplierPayment(supplier, 'validation'),
        { disabled: supplier.totalDebt <= 0 },
      ),
      listAction('Reintegro', 'EXECUTE', 'undo', () => this.openBalanceAction(supplier, 'refund'), {
        disabled: supplier.supplierBalance <= 0,
      }),
      listAction('Generar anticipo', 'EXECUTE', 'plus-circle', () =>
        this.openBalanceAction(supplier, 'advance'),
      ),
    ];
  }

  private openBalanceAction(supplier: SupplierDebtList, action: 'advance' | 'refund'): void {
    this.selectedSupplier.set(supplier);
    this.supplierDebtVisible.set(false);
    this.debtDialog().openBalanceAction(action);
  }

  onViewSupplierDebt(supplier: SupplierDebtList): void {
    this.selectedSupplier.set(supplier);
    this.supplierDebtVisible.set(true);
  }

  onCloseSupplierDebtDialog(): void {
    this.supplierDebtVisible.set(false);
    this.selectedSupplier.set(null);
    this.service.clearCurrentSupplier();
  }

  onSupplierDebtPayPurchase(purchase: SupplierPurchaseDebt): void {
    this.paymentPurchase.set(purchase);
    this.paymentFormMode.set('single');
    this.paymentSupplierName.set(this.selectedSupplier()?.supplierName ?? '');
    this.paymentTotalDebt.set(purchase.balance);
    this.paymentFormVisible.set(true);
  }

  onSupplierDebtPayAll(): void {
    this.openFromSelection('all');
  }

  onSupplierDebtPayPartial(): void {
    this.openFromSelection('partial');
  }

  onSupplierDebtPayWithValidation(): void {
    this.openFromSelection('validation');
  }

  onClosePaymentFormDialog(): void {
    this.paymentFormVisible.set(false);
    this.paymentPurchase.set(null);
    this.paymentSupplierName.set('');
    this.paymentTotalDebt.set(0);
  }

  onSubmitPayment(event: PaymentSubmitEvent): void {
    const supplier = this.selectedSupplier();
    if (!supplier) return;

    this.paymentSubmitting.set(true);

    if (this.paymentFormMode() === 'single' && this.paymentPurchase()) {
      this.service
        .payPurchase(this.paymentPurchase()!.purchaseId, event.request)
        .pipe(
          finalize(() => this.paymentSubmitting.set(false)),
          takeUntil(this.destroy$),
        )
        .subscribe({
          next: () => this.afterPayment(),
        });
      return;
    }

    if (this.paymentFormMode() === 'all') {
      this.service
        .payAllSupplierDebt(supplier.supplierId, event.request)
        .pipe(
          finalize(() => this.paymentSubmitting.set(false)),
          takeUntil(this.destroy$),
        )
        .subscribe({ next: () => this.afterPayment() });
      return;
    }

    if (this.paymentFormMode() === 'partial') {
      this.service
        .payPartialDebt(supplier.supplierId, event.request as PayPartialDebtRequest)
        .pipe(
          finalize(() => this.paymentSubmitting.set(false)),
          takeUntil(this.destroy$),
        )
        .subscribe({ next: () => this.afterPayment() });
      return;
    }

    this.service
      .createPayment({
        supplierId: supplier.supplierId,
        status: 'PENDING',
        amount: event.request.amount,
        paymentMethodId: event.request.paymentMethodId,
        ...(event.request.referenceNumber
          ? { referenceNumber: event.request.referenceNumber }
          : {}),
        paymentDate: event.request.paymentDate,
        ...(event.request.notes ? { notes: event.request.notes } : {}),
      })
      .pipe(
        finalize(() => this.paymentSubmitting.set(false)),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: () => {
          this.onClosePaymentFormDialog();
          this.loadSuppliers();
        },
      });
  }

  onViewPurchasePaymentHistory(purchase: SupplierPurchaseDebt): void {
    this.paymentHistorySupplierId.set(this.selectedSupplier()?.supplierId ?? '');
    this.paymentHistoryPurchaseId.set(purchase.purchaseId);
    this.paymentHistoryVisible.set(true);
  }

  onClosePaymentHistoryDialog(): void {
    this.paymentHistoryVisible.set(false);
    this.paymentHistorySupplierId.set('');
    this.paymentHistoryPurchaseId.set(null);
  }

  isOverdue(supplier: SupplierDebtList): boolean {
    return !!supplier.oldestDueDate && supplier.oldestDueDate < this.todayDate;
  }

  private openSupplierPayment(
    supplier: SupplierDebtList,
    mode: 'all' | 'partial' | 'validation',
  ): void {
    this.selectedSupplier.set(supplier);
    this.service
      .loadSupplierDebt(supplier.supplierId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (mode === 'all') this.onSupplierDebtPayAll();
        else if (mode === 'partial') this.onSupplierDebtPayPartial();
        else this.onSupplierDebtPayWithValidation();
      });
  }

  private openFromSelection(mode: 'all' | 'partial' | 'validation'): void {
    const supplier = this.selectedSupplier();
    if (!supplier) return;
    const summary = this.service.currentSupplier();
    this.paymentFormMode.set(mode);
    this.paymentSupplierName.set(supplier.supplierName);
    this.paymentTotalDebt.set(summary?.totalDebt ?? 0);
    this.paymentFormVisible.set(true);
  }

  private afterPayment(): void {
    this.onClosePaymentFormDialog();
    this.service.supplierDebtChange.next();
    this.debtDialog().refreshVisibleDetails();
    this.loadSuppliers();
  }

  private loadSuppliers(): void {
    const params: PayablesSearchParams = {
      page: Math.floor(this.first() / this.rows()),
      size: this.rows(),
    };
    if (this.searchTerm()) {
      params.search = this.searchTerm();
    }
    if (this.sortField() && this.sortOrder() !== 0) {
      params.sort = `${this.sortField()},${this.sortOrder() === 1 ? 'asc' : 'desc'}`;
    }
    this.service.searchSuppliersWithDebt(params).pipe(takeUntil(this.destroy$)).subscribe();
  }
}
