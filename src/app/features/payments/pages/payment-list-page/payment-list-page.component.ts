import { Component, inject, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
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
import { PaymentApplicationService } from '@features/payments/services/application/payment-application';
import { PaymentFilters } from '@features/payments/services/api/payment-api';
import { PaymentList } from '@features/payments/models/interfaces';


@Component({
  selector: 'app-payment-list-page',
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
  templateUrl: './payment-list-page.component.html',
  providers: [ConfirmationService],
})
export class PaymentListPageComponent implements OnInit {
  private service = inject(PaymentApplicationService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  payments = this.service.payments;
  loading = this.service.loading;
  totalElements = this.service.totalElements;

  searchTerm = signal('');
  first = signal(0);
  rows = signal(10);
  dateFrom = signal<string | null>(null);
  dateTo = signal<string | null>(null);

  activeFilterCount = computed(() => {
    let count = 0;
    if (this.dateFrom()) count++;
    if (this.dateTo()) count++;
    return count;
  });

  showInitialLoading = computed(() => this.loading() && this.payments().length === 0);
  isEmptyDatabase = computed(
    () =>
      !this.loading() &&
      this.totalElements() === 0 &&
      !this.dateFrom() &&
      !this.dateTo() &&
      !this.searchTerm(),
  );
  hasFilteredResults = computed(
    () =>
      !this.loading() &&
      this.totalElements() === 0 &&
      (this.dateFrom() || this.dateTo() || !!this.searchTerm()),
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
    this.first.set(0);
    this.loadWithFilters();
  }

  onCreate(): void {
    this.router.navigate(['/payments/new']);
  }

  onDetail(payment: PaymentList): void {
    this.router.navigate(['/payments', payment.id]);
  }

  onDelete(payment: PaymentList): void {
    this.confirmationService.confirm({
      header: 'Eliminar Pago',
      message: `¿Estás seguro de que deseas eliminar el pago "${payment.paymentNumber}"? Esta acción no se puede deshacer.`,
      acceptIcon: 'pi pi-trash',
      acceptLabel: 'Eliminar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.service.deletePayment(payment.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Pago eliminado exitosamente',
              life: 3000,
            });
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err?.error?.message || 'No se pudo eliminar el pago.',
              life: 5000,
            });
          },
        });
      },
    });
  }

  private loadWithFilters(): void {
    const filters: PaymentFilters = {};
    if (this.dateFrom()) filters.dateFrom = this.dateFrom()!;
    if (this.dateTo()) filters.dateTo = this.dateTo()!;
    this.service.loadPayments(filters).subscribe();
  }
}
