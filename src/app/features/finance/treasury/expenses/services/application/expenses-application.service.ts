import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, finalize, forkJoin, map, tap } from 'rxjs';
import { PagedResponse } from '@shared/models/interfaces/paged-response.interface';
import { PaymentMethodApplicationService } from '@features/finance/treasury/payment-methods/services/application/payment-method-application.service';
import { PaymentMethodList } from '@features/finance/treasury/payment-methods/models/interfaces/payment-method.interface';
import { CashRegisterApplicationService } from '@features/finance/treasury/cash-register/services/application/cash-register-application.service';
import { CashRegisterApiService } from '@features/finance/treasury/cash-register/services/api/cash-register-api.service';
import {
  CashMovementResponse,
  CashRegisterResponse,
} from '@features/finance/treasury/cash-register/models/interfaces/closure.interface';
import { ExpenseApiService } from '@features/finance/treasury/expenses/services/api/expense-api.service';
import {
  Expense,
  ExpenseCreate,
  ExpenseFilters,
  ExpenseRegisterOption,
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
  readonly registers = signal<ExpenseRegisterOption[]>([]);
  readonly loading = signal(false);
  readonly totalElements = signal(0);

  readonly hasOpenRegister = computed(() => this.activeClosure()?.status === 'OPEN');
  readonly hasRegisters = computed(() => this.registers().length > 0);
  readonly defaultRegisterId = computed(
    () => this.activeClosure()?.id ?? this.registers()[0]?.id ?? '',
  );

  readonly paymentMethods = computed<PaymentMethodList[]>(() =>
    this.paymentMethodService.paymentMethods().filter((method) => method.isActive),
  );

  readonly totalAmount = computed(() =>
    this.expenses()
      .filter((expense) => !expense.cancelled)
      .reduce((total, expense) => total + expense.amount, 0),
  );
  readonly count = computed(() => this.expenses().filter((expense) => !expense.cancelled).length);

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

  loadRegisters(): Observable<ExpenseRegisterOption[]> {
    return this.api.listRegisters().pipe(
      tap((registers) => this.registers.set(registers)),
      takeUntilDestroyed(this.destroyRef),
    );
  }

  loadContext(): Observable<CashRegisterResponse | null> {
    this.loadPaymentMethods();
    return forkJoin({
      registers: this.loadRegisters(),
      active: this.cashRegister.loadActiveClosure(),
    }).pipe(map(({ active }) => active));
  }

  loadExpense(id: string): Observable<Expense | undefined> {
    this.loading.set(true);
    return this.api.getById(id).pipe(
      tap((expense) => this.currentExpense.set(expense ?? null)),
      finalize(() => this.loading.set(false)),
      takeUntilDestroyed(this.destroyRef),
    );
  }

  createExpense(request: ExpenseCreate): Observable<CashMovementResponse> {
    this.loading.set(true);
    return this.api.create(request).pipe(
      tap(() => {
        this.loadRegisters().subscribe();
        this.cashRegister.loadActiveClosure().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
      }),
      finalize(() => this.loading.set(false)),
      takeUntilDestroyed(this.destroyRef),
    );
  }

  cancelExpense(id: string, reason: string): Observable<CashMovementResponse> {
    this.loading.set(true);
    return this.api.cancel(id, reason).pipe(
      tap(() => {
        this.expenses.update((expenses) =>
          expenses.map((expense) =>
            expense.id === id
              ? { ...expense, cancelled: true, cancellationReason: reason }
              : expense,
          ),
        );
        this.loadRegisters().subscribe();
        this.cashRegister.loadActiveClosure().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
      }),
      finalize(() => this.loading.set(false)),
      takeUntilDestroyed(this.destroyRef),
    );
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
        this.loadRegisters().subscribe();
        this.cashRegister.loadActiveClosure().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
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
