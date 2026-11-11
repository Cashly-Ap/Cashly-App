import { TranslateOptionsPipe } from '@core/i18n/translate-options.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { LanguageService } from '@core/i18n/language.service';
import { TranslationService } from '@core/i18n/translation.service';
import { connectListNavigation } from '@shared/components/list/list-navigation.service';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { SortEvent } from 'primeng/api';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import {
  provideTranslatedConfirmation,
  provideTranslatedMessages,
} from '@core/i18n/translated-feedback.service';
import { ExpensesApplicationService } from '@features/finance/treasury/expenses/services/application/expenses-application.service';
import {
  Expense,
  ExpenseFilters,
} from '@features/finance/treasury/expenses/models/interfaces/expense.interface';
import { PageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';
import { PanelCardComponent } from '@shared/components/ui/panel-card/panel-card.component';
import { EmptyStateComponent } from '@shared/components/ui/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '@shared/components/ui/loading-spinner/loading-spinner.component';
import { SubmitButtonComponent } from '@shared/components/ui/submit-button/submit-button.component';
import { SearchFieldComponent } from '@shared/components/ui/search-field/search-field.component';
import { FilterFieldComponent } from '@shared/components/ui/filter-field/filter-field.component';
import { PaginatorComponent } from '@shared/components/ui/paginator/paginator.component';
import {
  ListAction,
  ListActionButtonsComponent,
  ListContainerComponent,
  ListFilterComponent,
  listAction,
  auditHistoryAction,
} from '@shared/components/list';
import { LocalizedCurrencyPipe, LocalizedDatePipe } from '@core/i18n/localized-format.pipe';
import { ExpenseCancelDialogComponent } from '@features/finance/treasury/expenses/components/expense-cancel-dialog/expense-cancel-dialog.component';

@Component({
  selector: 'app-expenses-list-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeaderComponent,
    PanelCardComponent,
    EmptyStateComponent,
    LoadingSpinnerComponent,
    SubmitButtonComponent,
    SearchFieldComponent,
    FilterFieldComponent,
    PaginatorComponent,
    ListContainerComponent,
    ListFilterComponent,
    ListActionButtonsComponent,
    TranslatePipe,
    TranslateOptionsPipe,
    LocalizedDatePipe,
    LocalizedCurrencyPipe,
    ExpenseCancelDialogComponent,
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DatePickerModule,
    SelectModule,
    ConfirmDialogModule,
  ],
  templateUrl: './expenses-list-page.component.html',
  providers: [provideTranslatedConfirmation(), provideTranslatedMessages()],
})
export class ExpensesListPageComponent implements OnInit {
  protected readonly service = inject(ExpensesApplicationService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly confirmation = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly translation = inject(TranslationService);
  private readonly locale = inject(LanguageService).locale;

  protected readonly loading = this.service.loading;
  protected readonly totalElements = this.service.totalElements;

  readonly searchTerm = signal('');
  readonly first = signal(0);
  readonly rows = signal(10);
  readonly orderBy = signal('occurredAt');
  readonly orderDir = signal<'asc' | 'desc'>('desc');
  readonly filterDateFrom = signal<Date | null>(null);
  readonly filterDateTo = signal<Date | null>(null);
  readonly filterPaymentMethodId = signal('');
  readonly filterRegisterId = signal('');
  readonly expenseToCancel = signal<Expense | null>(null);
  readonly cancelDialogVisible = signal(false);

  readonly paymentMethodOptions = computed(() => this.service.paymentMethods());

  readonly registerOptions = computed(() => {
    const formatter = new Intl.DateTimeFormat(this.locale(), {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    return this.service.registers().map((register) => ({
      id: register.id,
      label: `${formatter.format(new Date(register.openedAt))} · ${
        register.status === 'OPEN'
          ? this.translation.t('finance.treasury.expenses.openRegister')
          : this.translation.t('finance.treasury.expenses.closedRegister')
      }`,
    }));
  });

  readonly activeFilterCount = computed(() => {
    let count = 0;
    if (this.filterDateFrom()) count++;
    if (this.filterDateTo()) count++;
    if (this.filterPaymentMethodId()) count++;
    if (this.filterRegisterId()) count++;
    return count;
  });

  readonly showInitialLoading = computed(
    () => this.loading() && this.service.expenses().length === 0,
  );
  readonly isEmptyDatabase = computed(
    () =>
      !this.loading() &&
      this.totalElements() === 0 &&
      this.activeFilterCount() === 0 &&
      !this.searchTerm(),
  );
  readonly hasFilteredResults = computed(
    () =>
      !this.loading() &&
      this.totalElements() === 0 &&
      (this.activeFilterCount() > 0 || !!this.searchTerm()),
  );

  private readonly listNavigation = connectListNavigation({
    records: () => this.service.expenses(),
    loading: () => this.loading(),
    total: () => this.totalElements(),
    first: () => this.first(),
    rows: () => this.rows(),
    search: (term) => {
      this.clearFilters();
      this.onSearch(term);
    },
    paginate: (event) => this.onPageChange(event),
    label: (record) => record.description,
    description: (record) => `${record.paymentMethodName} · ${record.amount}`,
    refresh: () => this.loadWithFilters(),
    actions: (record) => this.actionsFor(record),
  });

  ngOnInit(): void {
    this.service.loadContext().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    this.loadWithFilters();
  }

  onSearch(value: string): void {
    this.searchTerm.set(value);
    this.first.set(0);
    this.loadWithFilters();
  }

  onPageChange(event: { first: number; rows: number }): void {
    this.first.set(event.first ?? 0);
    this.rows.set(event.rows ?? 10);
    this.loadWithFilters();
  }

  onSort(event: SortEvent): void {
    const field = event.field ?? 'occurredAt';
    const direction = event.order === 1 ? 'asc' : 'desc';
    if (field === this.orderBy() && direction === this.orderDir()) return;
    this.orderBy.set(field);
    this.orderDir.set(direction);
    this.first.set(0);
    this.loadWithFilters();
  }

  onDateFromChange(value: Date | null): void {
    this.filterDateFrom.set(value);
    this.first.set(0);
    this.loadWithFilters();
  }

  onDateToChange(value: Date | null): void {
    this.filterDateTo.set(value);
    this.first.set(0);
    this.loadWithFilters();
  }

  onPaymentMethodFilterChange(value: string | null): void {
    const normalized = value ?? '';
    if (normalized === this.filterPaymentMethodId()) return;
    this.filterPaymentMethodId.set(normalized);
    this.first.set(0);
    this.loadWithFilters();
  }

  onRegisterFilterChange(value: string | null): void {
    const normalized = value ?? '';
    if (normalized === this.filterRegisterId()) return;
    this.filterRegisterId.set(normalized);
    this.first.set(0);
    this.loadWithFilters();
  }

  clearFilters(): void {
    this.filterDateFrom.set(null);
    this.filterDateTo.set(null);
    this.filterPaymentMethodId.set('');
    this.filterRegisterId.set('');
  }

  clearAllFilters(): void {
    this.clearFilters();
    this.first.set(0);
    this.loadWithFilters();
  }

  onCreate(): void {
    if (!this.service.hasRegisters()) return;
    this.router.navigate(['/finance/treasury/expenses/new']);
  }

  onView(expense: Expense): void {
    this.router.navigate(['/finance/treasury/expenses', expense.id]);
  }

  actionsFor(expense: Expense): ListAction[] {
    const actions: ListAction[] = [
      listAction('Ver detalle', 'EXECUTE', 'eye', () => this.onView(expense)),
    ];

    if (!expense.cancelled && expense.registerStatus === 'OPEN') {
      actions.push(
        listAction('Eliminar gasto', 'EXECUTE', 'trash', () => this.onDelete(expense), {
          danger: true,
        }),
      );
    }

    if (!expense.cancelled && expense.registerStatus === 'CLOSED') {
      actions.push(
        listAction('Cancelar gasto', 'EXECUTE', 'times-circle', () => this.onCancel(expense), {
          danger: true,
        }),
      );
    }

    actions.push(
      auditHistoryAction({
        entityType: 'CASH_MOVEMENT',
        entityId: expense.id,
        label: expense.description,
        subtitle: expense.paymentMethodName,
      }),
    );

    return actions;
  }

  onCancel(expense: Expense): void {
    this.expenseToCancel.set(expense);
    this.cancelDialogVisible.set(true);
  }

  onCancelConfirmed(event: { id: string; reason: string }): void {
    this.service.cancelExpense(event.id, event.reason).subscribe({
      next: () => {
        this.cancelDialogVisible.set(false);
        this.expenseToCancel.set(null);
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Gasto cancelado exitosamente',
          life: 3000,
        });
        this.loadWithFilters();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cancelar el gasto. Por favor, intente nuevamente.',
          life: 5000,
        });
      },
    });
  }

  onCancelDialogClosed(): void {
    this.cancelDialogVisible.set(false);
    this.expenseToCancel.set(null);
  }

  private onDelete(expense: Expense): void {
    this.confirmation.confirm({
      header: 'Eliminar gasto',
      message: '¿Está seguro de que desea eliminar este gasto? Esta acción no se puede deshacer.',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.service.deleteExpense(expense.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Gasto eliminado exitosamente',
              life: 3000,
            });
            this.loadWithFilters();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al eliminar el gasto. Por favor, intente nuevamente.',
              life: 5000,
            });
          },
        });
      },
    });
  }

  private loadWithFilters(): void {
    const filters: ExpenseFilters = {
      page: Math.floor(this.first() / this.rows()),
      size: this.rows(),
      orderBy: this.orderBy() as ExpenseFilters['orderBy'],
      orderDir: this.orderDir(),
    };
    if (this.searchTerm()) filters.search = this.searchTerm();
    if (this.filterDateFrom()) filters.dateFrom = this.toIsoDate(this.filterDateFrom()!);
    if (this.filterDateTo()) filters.dateTo = this.toIsoDate(this.filterDateTo()!);
    if (this.filterPaymentMethodId()) filters.paymentMethodId = this.filterPaymentMethodId();
    if (this.filterRegisterId()) filters.registerId = this.filterRegisterId();

    this.service.loadExpenses(filters).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  private toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
