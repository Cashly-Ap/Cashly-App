import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MainLayoutComponent } from '@core/layouts/main-layout.component';
import { ContentCardComponent } from '@shared/components/ui/content-card/content-card.component';
import { ListContainerComponent } from '@shared/components/list/list-container/list-container.component';
import { LoadingSpinnerComponent } from '@shared/components/ui/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '@shared/components/ui/empty-state/empty-state.component';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DatePickerModule } from 'primeng/datepicker';
import { PaginatorModule } from 'primeng/paginator';
import { PopoverModule } from 'primeng/popover';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { CashRegisterApplicationService } from '../../services/application/cash-register-application.service';

@Component({
  selector: 'app-cash-register-history-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    RouterModule,
    MainLayoutComponent,
    ContentCardComponent,
    ListContainerComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    TableModule,
    ButtonModule,
    TagModule,
    DatePickerModule,
    PaginatorModule,
    PopoverModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule,
  ],
  templateUrl: './cash-register-history-page.component.html',
})
export class CashRegisterHistoryPageComponent implements OnInit {
  private readonly service = inject(CashRegisterApplicationService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly history = this.service.history;
  readonly loading = this.service.loading;
  readonly totalElements = this.service.totalElements;

  readonly first = signal(0);
  readonly rows = signal(10);
  readonly filterDateFrom = signal<Date | null>(null);
  readonly filterDateTo = signal<Date | null>(null);
  readonly orderBy = signal('closureDate');
  readonly orderDir = signal<'asc' | 'desc'>('desc');

  readonly activeFilterCount = computed(() => {
    let count = 0;
    if (this.filterDateFrom()) count++;
    if (this.filterDateTo()) count++;
    return count;
  });

  readonly showInitialLoading = computed(
    () => this.loading() && (this.history()?.length ?? 0) === 0,
  );

  readonly isEmptyDatabase = computed(
    () =>
      !this.loading() &&
      this.totalElements() === 0 &&
      this.activeFilterCount() === 0,
  );

  readonly hasFilteredResults = computed(
    () =>
      !this.loading() &&
      this.totalElements() === 0 &&
      this.activeFilterCount() > 0,
  );

  ngOnInit(): void {
    this.loadHistory();
  }

  onDateFromChange(value: Date | null): void {
    this.filterDateFrom.set(value);
    this.first.set(0);
    this.loadHistory();
  }

  onDateToChange(value: Date | null): void {
    this.filterDateTo.set(value);
    this.first.set(0);
    this.loadHistory();
  }

  onPageChange(event: { first: number; rows: number }): void {
    this.first.set(event.first ?? 0);
    this.rows.set(event.rows ?? 10);
    this.loadHistory();
  }

  onSort(field: string): void {
    if (this.orderBy() === field) {
      this.orderDir.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.orderBy.set(field);
      this.orderDir.set('desc');
    }
    this.first.set(0);
    this.loadHistory();
  }

  getSortIcon(field: string): string {
    if (this.orderBy() !== field) return 'pi pi-sort-alt';
    return this.orderDir() === 'asc'
      ? 'pi pi-sort-up'
      : 'pi pi-sort-down';
  }

  clearFilters(): void {
    this.filterDateFrom.set(null);
    this.filterDateTo.set(null);
    this.first.set(0);
    this.loadHistory();
  }

  onBack(): void {
    this.router.navigate(['/cash-register']);
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'OPEN':
        return 'Abierto';
      case 'CLOSED':
        return 'Cerrado';
      default:
        return status;
    }
  }

  getStatusSeverity(
    status: string,
  ): 'info' | 'warn' | 'success' | 'contrast' {
    switch (status) {
      case 'OPEN':
        return 'info';
      case 'CLOSED':
        return 'warn';
      default:
        return 'contrast';
    }
  }

  get currentPage(): number {
    return this.first() / this.rows();
  }

  private loadHistory(): void {
    const sort = `${this.orderBy()},${this.orderDir()}`;
    const dateFrom = this.filterDateFrom()
      ? this.filterDateFrom()!.toISOString().split('T')[0]
      : undefined;
    const dateTo = this.filterDateTo()
      ? this.filterDateTo()!.toISOString().split('T')[0]
      : undefined;

    this.service
      .loadHistory(this.currentPage, this.rows(), dateFrom, dateTo, sort)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }
}
