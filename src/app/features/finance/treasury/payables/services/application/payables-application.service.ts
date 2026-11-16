import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';
import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, Subject, tap, catchError, finalize, of } from 'rxjs';
import { MessageService } from 'primeng/api';
import { AuthService } from '@features/platform/auth/services/application/auth-application.service';
import {
  PayablesApiService,
  PayablesSearchParams,
} from '@features/finance/treasury/payables/services/api/payables-api.service';
import { PAYABLES_ERROR_MESSAGES } from '@features/finance/treasury/payables/messages/error-messages';
import { PAYABLES_SUCCESS_MESSAGES } from '@features/finance/treasury/payables/messages/success-messages';
import { GlobalPayableSummary } from '@features/finance/treasury/payables/models/interfaces/global-payable-summary.interface';
import { SupplierDebtList } from '@features/finance/treasury/payables/models/interfaces/supplier-debt-list.interface';
import { SupplierDebtSummary } from '@features/finance/treasury/payables/models/interfaces/supplier-debt-summary.interface';
import { SupplierPurchaseDebt } from '@features/finance/treasury/payables/models/interfaces/supplier-purchase-debt.interface';
import { SupplierPayment } from '@features/finance/treasury/payables/models/interfaces/supplier-payment.interface';
import { PaymentResult } from '@features/finance/treasury/payables/models/interfaces/payment-result.interface';
import {
  CreateSupplierPaymentRequest,
  CreatedSupplierPaymentResponse,
  PayPurchaseRequest,
  PaySupplierDebtRequest,
  PayPartialDebtRequest,
} from '@features/finance/treasury/payables/models/interfaces/payment-request.interface';
import { PagedResponse } from '@shared/models/interfaces/paged-response.interface';

@Injectable({ providedIn: 'root' })
export class PayablesApplicationService {
  private readonly api = inject(PayablesApiService);
  private readonly messageService = inject(MessageService);
  private readonly authService = inject(AuthService);

  readonly globalSummary = signal<GlobalPayableSummary | null>(null);
  readonly suppliers = signal<SupplierDebtList[]>([]);
  readonly currentSupplier = signal<SupplierDebtSummary | null>(null);
  readonly supplierPurchases = signal<SupplierPurchaseDebt[]>([]);
  readonly pendingPayments = signal<SupplierPayment[]>([]);
  readonly paymentHistory = signal<SupplierPayment[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  readonly totalSuppliers = signal(0);
  readonly totalPendingPayments = signal(0);
  readonly totalPaymentHistory = signal(0);
  readonly totalSupplierPurchases = signal(0);

  readonly supplierDebtChange = new Subject<void>();
  readonly pendingPaymentsChange = new Subject<void>();

  readonly canExecute = computed(() =>
    this.authService.hasPermission(BusinessModule.FINANCE_PAYABLES, 'EXECUTE'),
  );

  loadGlobalSummary(): Observable<GlobalPayableSummary | null> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.getGlobalSummary().pipe(
      tap({
        next: (summary) => this.globalSummary.set(summary),
        error: () => {
          this.error.set(PAYABLES_ERROR_MESSAGES.LOAD_GLOBAL_SUMMARY_FAILED);
          this.notifyError(PAYABLES_ERROR_MESSAGES.LOAD_GLOBAL_SUMMARY_FAILED);
        },
      }),
      catchError(() => of(null)),
      finalize(() => this.loading.set(false)),
    );
  }

  searchSuppliersWithDebt(
    params?: PayablesSearchParams,
  ): Observable<PagedResponse<SupplierDebtList> | null> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.searchSuppliersWithDebt(params).pipe(
      tap({
        next: (res) => {
          this.suppliers.set(res.content ?? []);
          this.totalSuppliers.set(res.totalElements ?? 0);
        },
        error: () => {
          this.error.set(PAYABLES_ERROR_MESSAGES.SEARCH_SUPPLIERS_FAILED);
          this.notifyError(PAYABLES_ERROR_MESSAGES.SEARCH_SUPPLIERS_FAILED);
        },
      }),
      catchError(() => of(null)),
      finalize(() => this.loading.set(false)),
    );
  }

  loadSupplierDebt(supplierId: string): Observable<SupplierDebtSummary | null> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.getSupplierDebt(supplierId).pipe(
      tap({
        next: (summary) => this.currentSupplier.set(summary),
        error: () => {
          this.error.set(PAYABLES_ERROR_MESSAGES.LOAD_SUPPLIER_DEBT_FAILED);
          this.notifyError(PAYABLES_ERROR_MESSAGES.LOAD_SUPPLIER_DEBT_FAILED);
        },
      }),
      catchError(() => of(null)),
      finalize(() => this.loading.set(false)),
    );
  }

  loadSupplierPurchases(
    supplierId: string,
    params?: PayablesSearchParams,
  ): Observable<PagedResponse<SupplierPurchaseDebt> | null> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.getSupplierPurchases(supplierId, params).pipe(
      tap({
        next: (res) => {
          this.supplierPurchases.set(res.content ?? []);
          this.totalSupplierPurchases.set(res.totalElements ?? 0);
        },
        error: () => {
          this.error.set(PAYABLES_ERROR_MESSAGES.LOAD_SUPPLIER_PURCHASES_FAILED);
          this.notifyError(PAYABLES_ERROR_MESSAGES.LOAD_SUPPLIER_PURCHASES_FAILED);
        },
      }),
      catchError(() => of(null)),
      finalize(() => this.loading.set(false)),
    );
  }

  payPurchase(purchaseId: string, request: PayPurchaseRequest): Observable<PaymentResult | null> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.payPurchase(purchaseId, request).pipe(
      tap({
        next: () => this.notifySuccess(PAYABLES_SUCCESS_MESSAGES.PURCHASE_PAID),
        error: () => {
          this.error.set(PAYABLES_ERROR_MESSAGES.PAY_PURCHASE_FAILED);
          this.notifyError(PAYABLES_ERROR_MESSAGES.PAY_PURCHASE_FAILED);
        },
      }),
      catchError(() => of(null)),
      finalize(() => this.loading.set(false)),
    );
  }

  payAllSupplierDebt(
    supplierId: string,
    request: PaySupplierDebtRequest,
  ): Observable<PaymentResult | null> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.payAllSupplierDebt(supplierId, request).pipe(
      tap({
        next: () => this.notifySuccess(PAYABLES_SUCCESS_MESSAGES.ALL_DEBT_PAID),
        error: () => {
          this.error.set(PAYABLES_ERROR_MESSAGES.PAY_ALL_DEBT_FAILED);
          this.notifyError(PAYABLES_ERROR_MESSAGES.PAY_ALL_DEBT_FAILED);
        },
      }),
      catchError(() => of(null)),
      finalize(() => this.loading.set(false)),
    );
  }

  payPartialDebt(
    supplierId: string,
    request: PayPartialDebtRequest,
  ): Observable<PaymentResult | null> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.payPartialDebt(supplierId, request).pipe(
      tap({
        next: () => this.notifySuccess(PAYABLES_SUCCESS_MESSAGES.PARTIAL_DEBT_PAID),
        error: () => {
          this.error.set(PAYABLES_ERROR_MESSAGES.PAY_PARTIAL_DEBT_FAILED);
          this.notifyError(PAYABLES_ERROR_MESSAGES.PAY_PARTIAL_DEBT_FAILED);
        },
      }),
      catchError(() => of(null)),
      finalize(() => this.loading.set(false)),
    );
  }

  createPayment(
    request: CreateSupplierPaymentRequest,
  ): Observable<CreatedSupplierPaymentResponse | null> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.createPayment(request).pipe(
      tap({
        next: () => {
          this.notifySuccess(PAYABLES_SUCCESS_MESSAGES.PAYMENT_REGISTERED_FOR_VALIDATION);
          this.pendingPaymentsChange.next();
          this.supplierDebtChange.next();
        },
        error: () => {
          this.error.set(PAYABLES_ERROR_MESSAGES.CREATE_PAYMENT_FAILED);
          this.notifyError(PAYABLES_ERROR_MESSAGES.CREATE_PAYMENT_FAILED);
        },
      }),
      catchError(() => of(null)),
      finalize(() => this.loading.set(false)),
    );
  }

  loadPendingPayments(
    params?: PayablesSearchParams,
  ): Observable<PagedResponse<SupplierPayment> | null> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.getPaymentHistory(params).pipe(
      tap({
        next: (res) => {
          this.pendingPayments.set(res.content ?? []);
          this.totalPendingPayments.set(res.totalElements ?? 0);
        },
        error: () => {
          this.error.set(PAYABLES_ERROR_MESSAGES.LOAD_PENDING_PAYMENTS_FAILED);
          this.notifyError(PAYABLES_ERROR_MESSAGES.LOAD_PENDING_PAYMENTS_FAILED);
        },
      }),
      catchError(() => of(null)),
      finalize(() => this.loading.set(false)),
    );
  }

  loadPaymentHistory(
    params?: PayablesSearchParams,
  ): Observable<PagedResponse<SupplierPayment> | null> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.getPaymentHistory(params).pipe(
      tap({
        next: (res) => {
          this.paymentHistory.set(res.content ?? []);
          this.totalPaymentHistory.set(res.totalElements ?? 0);
        },
        error: () => {
          this.error.set(PAYABLES_ERROR_MESSAGES.LOAD_PAYMENT_HISTORY_FAILED);
          this.notifyError(PAYABLES_ERROR_MESSAGES.LOAD_PAYMENT_HISTORY_FAILED);
        },
      }),
      catchError(() => of(null)),
      finalize(() => this.loading.set(false)),
    );
  }

  clearCurrentSupplier(): void {
    this.currentSupplier.set(null);
    this.supplierPurchases.set([]);
    this.totalSupplierPurchases.set(0);
  }

  clearError(): void {
    this.error.set(null);
  }

  private notifySuccess(detail: string): void {
    this.messageService.add({ severity: 'success', summary: 'Éxito', detail, life: 3000 });
  }

  private notifyError(detail: string): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail, life: 5000 });
  }
}
