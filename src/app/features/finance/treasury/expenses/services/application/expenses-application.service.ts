import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, finalize, tap } from 'rxjs';
import { PagedResponse } from '@shared/models/interfaces/paged-response.interface';
import { PaymentMethodApplicationService } from '@features/finance/treasury/payment-methods/services/application/payment-method-application.service';
import { PaymentMethodList } from '@features/finance/treasury/payment-methods/models/interfaces/payment-method.interface';
import { CashRegisterApplicationService } from '@features/finance/treasury/cash-register/services/application/cash-register-application.service';
import { CashRegisterApiService } from '@features/finance/treasury/cash-register/services/api/cash-register-api.service';
import { CashRegisterResponse } from '@features/finance/treasury/cash-register/models/interfaces/closure.interface';
import { ExpenseApiService } from '@features/finance/treasury/expenses/services/api/expense-api.service';
import {
  Expense,
  ExpenseCreate,
  ExpenseFilters,
} from '@features/finance/treasury/expenses/models/interfaces/expense.interface';

@Injectable({ providedIn: 'root' })
export class ExpensesApplicationService {
  private readonly api = inject(ExpenseApiService);
  private readonly cashRegisterApi = inject(CashRegisterApiService);
  private readonly cashRegister = inject(CashRegisterApplicationService);
  private readonly paymentMethodService = inject(PaymentMethodApplicationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly activeClosure = this.cashRegister.activeClosure;
  readonly expenses = signal<Expense[]>([]);
  readonly currentExpense = signal<Expense | null>(null);
  readonly loading = signal(false);
  readonly totalElements = signal(0);
  readonly hasOpenRegister = computed(() => this.activeClosure()?.status === 'OPEN');

  readonly paymentMethods = computed<PaymentMethodList[]>(() =>
    this.paymentMethodService.paymentMethods().filter((method) => method.isActive),
  );

  readonly totalAmount = computed(() =>
    this.expenses().reduce((total, expense) => total + expense.amount, 0),
  );
  readonly count = computed(() => this.expenses().length);

  loadExpenses(filters: ExpenseFilters = {}): Observable<PagedResponse<Expense>> {
    this.loading.set(true);
    return this.api.list(filters).pipe(
      tap({
        next: (response) => {
          this.expenses.set(response.content ?? []);
          this.totalElements.set(response.totalElements ?? 0);
        },
      }),
      finalize(() => this.loading.set(false)),
      takeUntilDestroyed(this.destroyRef),
    );
  }

  loadContext(): Observable<CashRegisterResponse | null> {
    this.loadPaymentMethods();
    return this.cashRegister.loadActiveClosure();
  }

  loadExpense(id: string): Observable<Expense | undefined> {
    this.loading.set(true);
    return this.api.getById(id).pipe(
      tap((expense) => this.currentExpense.set(expense ?? null)),
      finalize(() => this.loading.set(false)),
      takeUntilDestroyed(this.destroyRef),
    );
  }

  createExpense(request: ExpenseCreate): Observable<CashRegisterResponse | null> {
    const closure = this.activeClosure();
    if (!closure) {
      throw new Error('No hay una caja abierta para registrar el gasto');
    }
    return this.cashRegister.addMovement(closure.id, {
      direction: 'OUT',
      type: 'EXPENSE',
      amount: request.amount,
      paymentMethodId: request.paymentMethodId,
      description: request.description,
    });
  }

  findExpense(id: string): Expense | undefined {
    return this.expenses().find((expense) => expense.id === id);
  }

  deleteExpense(id: string): Observable<void> {
    this.loading.set(true);
    return this.cashRegisterApi.deleteMovement(id).pipe(
      tap(() => {
        this.expenses.update((expenses) => expenses.filter((expense) => expense.id !== id));
        this.totalElements.update((total) => Math.max(0, total - 1));
        this.cashRegister.loadActiveClosure().subscribe();
      }),
      finalize(() => this.loading.set(false)),
      takeUntilDestroyed(this.destroyRef),
    );
  }

  private loadPaymentMethods(): void {
    this.paymentMethodService
      .loadPaymentMethods({ active: true, page: 0, size: 100 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }
}
