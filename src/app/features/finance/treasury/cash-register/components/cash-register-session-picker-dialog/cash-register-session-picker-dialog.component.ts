import { StatusSeverity } from '@shared/models/status-variant';
import { LocalizedCurrencyPipe, LocalizedDatePipe } from '@core/i18n/localized-format.pipe';
import { TranslateOptionsPipe } from '@core/i18n/translate-options.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  model,
  output,
  signal,
  untracked,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { TextBadgeComponent } from '@shared/components/ui/text-badge/text-badge.component';
import { SearchFieldComponent } from '@shared/components/ui/search-field/search-field.component';
import { CancelButtonComponent } from '@shared/components/ui/cancel-button/cancel-button.component';
import { TableCardComponent } from '@shared/components/ui/table-card/table-card.component';
import { DialogHeaderComponent } from '@shared/components/ui/dialog-header/dialog-header.component';
import { FilterFieldComponent } from '@shared/components/ui/filter-field/filter-field.component';
import { ListFilterComponent } from '@shared/components/list/list-filter/list-filter.component';
import { TableRowSkeletonComponent } from '@shared/components/ui/skeletons/table-row-skeleton.component';
import { CardSkeletonComponent } from '@shared/components/ui/skeletons/card-skeleton.component';
import { DataTableComponent } from '@shared/components/ui/data-table/data-table.component';
import { CashRegisterApplicationService } from '@features/finance/treasury/cash-register/services/application/cash-register-application.service';
import { CashRegisterResponse } from '@features/finance/treasury/cash-register/models/interfaces/closure.interface';
import { cashRegisterStatusSeverity } from '@features/finance/treasury/cash-register/models/cash-register-status.presentation';

type SessionStatusFilter = 'OPEN' | 'CLOSED' | null;

@Component({
  selector: 'app-cash-register-session-picker-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslatePipe,
    TranslateOptionsPipe,
    LocalizedDatePipe,
    LocalizedCurrencyPipe,
    FormsModule,
    ButtonModule,
    DatePickerModule,
    DialogModule,
    SelectModule,
    TextBadgeComponent,
    SearchFieldComponent,
    CancelButtonComponent,
    TableCardComponent,
    DialogHeaderComponent,
    FilterFieldComponent,
    ListFilterComponent,
    TableRowSkeletonComponent,
    CardSkeletonComponent,
    DataTableComponent,
  ],
  templateUrl: './cash-register-session-picker-dialog.component.html',
})
export class CashRegisterSessionPickerDialogComponent {
  readonly visible = model(false);
  readonly selected = output<string>();

  private readonly service = inject(CashRegisterApplicationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly sessions = this.service.history;
  readonly loading = this.service.loading;
  readonly activeClosure = this.service.activeClosure;

  readonly search = signal('');
  readonly selectedSession = signal<CashRegisterResponse | null>(null);
  readonly filterDateFrom = signal<Date | null>(null);
  readonly filterDateTo = signal<Date | null>(null);
  readonly filterStatus = signal<SessionStatusFilter>(null);

  readonly statusOptions = [
    { label: 'finance.treasury.cashregister.statusOpen', value: 'OPEN' },
    { label: 'finance.treasury.cashregister.statusClosed', value: 'CLOSED' },
  ];

  readonly activeFilterCount = computed(() => {
    let count = 0;
    if (this.filterDateFrom()) count++;
    if (this.filterDateTo()) count++;
    if (this.filterStatus()) count++;
    return count;
  });

  readonly filteredSessions = computed(() => {
    const term = this.search().trim().toLowerCase();
    const status = this.filterStatus();

    return this.sessions().filter((register) => {
      if (status && register.status !== status) return false;
      if (!term) return true;

      return (
        this.matches(register.openedByName, term) ||
        this.matches(register.closedByName, term) ||
        this.matches(register.status, term)
      );
    });
  });

  constructor() {
    effect(() => {
      if (!this.visible()) return;

      untracked(() => {
        this.resetState();
        this.reload();
      });
    });
  }

  onSearchChange(value: string): void {
    this.search.set(value);
  }

  onDateFromChange(value: Date | null): void {
    this.filterDateFrom.set(value);
    this.reload();
  }

  onDateToChange(value: Date | null): void {
    this.filterDateTo.set(value);
    this.reload();
  }

  onStatusChange(value: SessionStatusFilter): void {
    this.filterStatus.set(value ?? null);
  }

  clearFilters(): void {
    this.filterDateFrom.set(null);
    this.filterDateTo.set(null);
    this.filterStatus.set(null);
    this.reload();
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'OPEN':
        return 'finance.treasury.cashregister.statusOpen';
      case 'CLOSED':
        return 'finance.treasury.cashregister.statusClosed';
      default:
        return status;
    }
  }

  getStatusSeverity(status: string): StatusSeverity {
    return cashRegisterStatusSeverity(status);
  }

  isSelected(register: CashRegisterResponse): boolean {
    return this.selectedSession()?.id === register.id;
  }

  onSelect(register: CashRegisterResponse): void {
    this.selectedSession.set(register);
  }

  onConfirm(): void {
    const register = this.selectedSession();
    if (!register) return;

    this.visible.set(false);
    this.selected.emit(register.id);
  }

  onCancel(): void {
    this.visible.set(false);
  }

  private resetState(): void {
    this.search.set('');
    this.filterDateFrom.set(null);
    this.filterDateTo.set(null);
    this.filterStatus.set(null);
    this.selectedSession.set(this.activeClosure());
  }

  private reload(): void {
    this.service
      .loadHistory(
        0,
        50,
        this.formatDate(this.filterDateFrom()),
        this.formatDate(this.filterDateTo()),
        'openedAt,desc',
        'SIMPLE',
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  private matches(value: string | null | undefined, term: string): boolean {
    return (value ?? '').toLowerCase().includes(term);
  }

  private formatDate(value: Date | null): string | undefined {
    if (!value) return undefined;

    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
