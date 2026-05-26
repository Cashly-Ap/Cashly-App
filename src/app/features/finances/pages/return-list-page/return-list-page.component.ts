import { ChangeDetectionStrategy, Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MainLayoutComponent } from '@core/layouts/main-layout.component';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { PaginatorModule } from 'primeng/paginator';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { PopoverModule } from 'primeng/popover';
import { DatePickerModule } from 'primeng/datepicker';
import { SortEvent } from 'primeng/api';
import { ContentCardComponent } from '@shared/components/ui/content-card/content-card.component';
import { LoadingSpinnerComponent } from '@shared/components/ui/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '@shared/components/ui/empty-state/empty-state.component';
import { ListContainerComponent } from '@shared/components/list/list-container/list-container.component';
import { TextBadgeComponent } from '@shared/components/ui/text-badge/text-badge.component';
import { FinanceApplicationService } from '@features/finances/services/application/finance-application.service';
import { ReturnFilters } from '@features/finances/services/api/return-api.service';
import { ReturnList } from '@features/finances/models/interfaces';
import { ReturnType, RETURN_TYPE_LABELS, getReturnTypeLabel } from '@features/finances/models/enums/return-type.enum';

@Component({
  selector: 'app-return-list-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    MainLayoutComponent,
    ButtonModule,
    TableModule,
    InputTextModule,
    SelectModule,
    PaginatorModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule,
    PopoverModule,
    DatePickerModule,
    ContentCardComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ListContainerComponent,
    TextBadgeComponent,
  ],
  templateUrl: './return-list-page.component.html',
})
export class ReturnListPageComponent implements OnInit {
  private readonly financeService = inject(FinanceApplicationService);
  private readonly router = inject(Router);

  readonly returns = this.financeService.returns;
  readonly loading = this.financeService.loading;
  readonly totalElements = this.financeService.totalElements;

  readonly searchTerm = signal('');
  readonly first = signal(0);
  readonly rows = signal(10);
  readonly selectedReturnType = signal('');
  readonly filterDateFrom = signal<Date | null>(null);
  readonly filterDateTo = signal<Date | null>(null);

  readonly orderBy = signal('createdAt');
  readonly orderDir = signal<'asc' | 'desc'>('desc');

  readonly returnTypeOptions = [
    { label: 'Todos los tipos', value: '' },
    ...Object.values(ReturnType).map((t) => ({ label: RETURN_TYPE_LABELS[t], value: t })),
  ];

  readonly activeFilterCount = computed(() => {
    let count = 0;
    if (this.selectedReturnType()) count++;
    if (this.filterDateFrom()) count++;
    if (this.filterDateTo()) count++;
    return count;
  });

  readonly showInitialLoading = computed(() => this.loading() && (this.returns()?.length ?? 0) === 0);
  readonly isEmptyDatabase = computed(
    () => !this.loading() && this.totalElements() === 0 && this.activeFilterCount() === 0 && !this.searchTerm(),
  );
  readonly hasFilteredResults = computed(
    () => !this.loading() && this.totalElements() === 0 && (this.activeFilterCount() > 0 || !!this.searchTerm()),
  );

  ngOnInit(): void {
    this.loadWithFilters();
  }

  onSearch(value: string): void {
    this.searchTerm.set(value);
    this.first.set(0);
    this.loadWithFilters();
  }

  onReturnTypeFilterChange(value: string | null): void {
    const normalized = value ?? '';
    if (normalized === this.selectedReturnType()) return;
    this.selectedReturnType.set(normalized);
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

  onPageChange(event: { first: number; rows: number }): void {
    this.first.set(event.first ?? 0);
    this.rows.set(event.rows ?? 10);
  }

  onSort(event: SortEvent): void {
    const newField = event.field ?? 'createdAt';
    const newDir = event.order === 1 ? 'asc' : 'desc';
    if (newField === this.orderBy() && newDir === this.orderDir()) return;
    this.orderBy.set(newField);
    this.orderDir.set(newDir);
    this.first.set(0);
    this.loadWithFilters();
  }

  clearFilters(): void {
    this.selectedReturnType.set('');
    this.filterDateFrom.set(null);
    this.filterDateTo.set(null);
    this.first.set(0);
    this.loadWithFilters();
  }

  onView(ret: ReturnList): void {
    this.router.navigate(['/returns', ret.id]);
  }

  onCreate(): void {
    this.router.navigate(['/returns/new']);
  }

  getReturnTypeLabel(type: string): string {
    return getReturnTypeLabel(type as ReturnType);
  }

  getReturnTypeVariant(type: string): 'info' | 'label' {
    return type === ReturnType.AUTOMATIC ? 'info' : 'label';
  }

  getStatusVariant(status: string): 'success' | 'danger' | 'info' | 'label' {
    const variants: Record<string, 'success' | 'danger' | 'info' | 'label'> = {
      PENDING: 'info',
      COMPLETED: 'success',
      CANCELLED: 'danger',
    };
    return variants[status] ?? 'label';
  }

  private loadWithFilters(): void {
    const filters: ReturnFilters = {};
    if (this.searchTerm()) filters.search = this.searchTerm();
    if (this.selectedReturnType()) filters.returnType = this.selectedReturnType();
    if (this.filterDateFrom()) filters.dateFrom = this.filterDateFrom()!.toISOString().split('T')[0];
    if (this.filterDateTo()) filters.dateTo = this.filterDateTo()!.toISOString().split('T')[0];
    filters.orderBy = this.orderBy();
    filters.orderDir = this.orderDir();
    this.financeService.loadReturns(filters).subscribe();
  }
}
