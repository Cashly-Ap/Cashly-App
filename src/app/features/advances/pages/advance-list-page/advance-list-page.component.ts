import {
  Component,
  inject,
  OnInit,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MainLayoutComponent } from '@core/layouts/main-layout.component';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { PopoverModule } from 'primeng/popover';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { ContentCardComponent } from '@shared/components/ui/content-card/content-card.component';
import { LoadingSpinnerComponent } from '@shared/components/ui/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '@shared/components/ui/empty-state/empty-state.component';
import { ListContainerComponent } from '@shared/components/list/list-container/list-container.component';
import { AdvanceApplicationService } from '../../services/application/advance-application.service';
import { AdvanceFilters } from '../../services/api/advance-api.service';
import { AdvanceList } from '../../models/interfaces';
import {
  AdvanceStatus,
  ADVANCE_STATUS_LABELS,
  getAdvanceStatusLabel,
} from '../../models/enums';

@Component({
  selector: 'app-advance-list-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    MainLayoutComponent,
    TableModule,
    ButtonModule,
    InputTextModule,
    PaginatorModule,
    IconFieldModule,
    InputIconModule,
    ConfirmDialogModule,
    PopoverModule,
    TooltipModule,
    DatePickerModule,
    SelectModule,
    ContentCardComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ListContainerComponent,
  ],
  templateUrl: './advance-list-page.component.html',
  providers: [ConfirmationService],
})
export class AdvanceListPageComponent implements OnInit {
  private service = inject(AdvanceApplicationService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  readonly ADVANCE_STATUS_LABELS = ADVANCE_STATUS_LABELS;

  getAdvanceStatusLabel(status: AdvanceStatus): string {
    return getAdvanceStatusLabel(status);
  }

  advances = this.service.advances;
  loading = this.service.loading;
  totalElements = this.service.totalElements;

  searchTerm = signal('');
  first = signal(0);
  rows = signal(10);
  dateFrom = signal<string | null>(null);
  dateTo = signal<string | null>(null);
  selectedStatus = signal<AdvanceStatus | null>(null);

  statusOptions = Object.values(AdvanceStatus).map((status) => ({
    value: status,
    label: ADVANCE_STATUS_LABELS[status],
  }));

  activeFilterCount = computed(() => {
    let count = 0;
    if (this.dateFrom()) count++;
    if (this.dateTo()) count++;
    if (this.selectedStatus()) count++;
    return count;
  });

  showInitialLoading = computed(
    () => this.loading() && this.advances().length === 0
  );
  isEmptyDatabase = computed(
    () =>
      !this.loading() &&
      this.totalElements() === 0 &&
      !this.dateFrom() &&
      !this.dateTo() &&
      !this.searchTerm() &&
      !this.selectedStatus()
  );
  hasFilteredResults = computed(
    () =>
      !this.loading() &&
      this.totalElements() === 0 &&
      (!!this.dateFrom() ||
        !!this.dateTo() ||
        !!this.searchTerm() ||
        !!this.selectedStatus())
  );

  ngOnInit(): void {
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

  clearFilters(): void {
    this.dateFrom.set(null);
    this.dateTo.set(null);
    this.selectedStatus.set(null);
    this.first.set(0);
    this.loadWithFilters();
  }

  onCreate(): void {
    this.router.navigate(['/advances/new']);
  }

  onDetail(advance: AdvanceList): void {
    this.router.navigate(['/advances', advance.id]);
  }

  onCancel(advance: AdvanceList): void {
    this.confirmationService.confirm({
      header: 'Anular Anticipo',
      message: `¿Estás seguro de que deseas anular el anticipo "${advance.advanceNumber}"? Esta acción no se puede deshacer.`,
      acceptIcon: 'pi pi-ban',
      acceptLabel: 'Anular',
      acceptButtonStyleClass: 'p-button-danger',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.service.cancel(advance.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Anticipo anulado exitosamente',
              life: 3000,
            });
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail:
                err?.error?.message || 'No se pudo anular el anticipo.',
              life: 5000,
            });
          },
        });
      },
    });
  }

  private loadWithFilters(): void {
    const filters: AdvanceFilters = {};
    if (this.dateFrom()) filters.dateFrom = this.dateFrom()!;
    if (this.dateTo()) filters.dateTo = this.dateTo()!;
    if (this.selectedStatus())
      filters.status = this.selectedStatus()!;
    this.service.loadAll(filters).subscribe();
  }
}
