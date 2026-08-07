import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MainLayoutComponent } from '@core/layouts/main-layout.component';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';
import {
  DetailsCardComponent,
  DetailsCardHeaderComponent,
  DetailsInfoFieldComponent,
  DetailsInfoGridComponent,
  DetailsSectionCardComponent,
} from '@shared/components/details';
import {
  EmptyStateComponent,
  LoadingSpinnerComponent,
  PageHeaderComponent,
  TextBadgeComponent,
} from '@shared/components/ui';
import { QuoteApplicationService } from '@features/quotes/services/application/quote-application.service';
import { QuoteStatus, getQuoteStatusLabel } from '@features/quotes/models/enums/quote-status.enum';
import { AssignWarehousesDialogComponent } from '@features/quotes/components/assign-warehouses-dialog/assign-warehouses-dialog.component';
import { AssignQuoteWarehousesRequest } from '@features/quotes/services/api/quote-api.service';
import { signal } from '@angular/core';

@Component({
  selector: 'app-quote-detail-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    DecimalPipe,
    MainLayoutComponent,
    ButtonModule,
    TableModule,
    DetailsCardComponent,
    DetailsCardHeaderComponent,
    DetailsInfoFieldComponent,
    DetailsInfoGridComponent,
    DetailsSectionCardComponent,
    EmptyStateComponent,
    LoadingSpinnerComponent,
    PageHeaderComponent,
    TextBadgeComponent,
    AssignWarehousesDialogComponent,
  ],
  templateUrl: './quote-detail-page.component.html',
})
export class QuoteDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly quoteService = inject(QuoteApplicationService);
  private readonly messageService = inject(MessageService);

  readonly quote = this.quoteService.currentQuote;
  readonly loading = this.quoteService.loading;

  readonly assignDialogVisible = signal(false);

  readonly QuoteStatus = QuoteStatus;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.quoteService.loadById(id).subscribe({
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar el presupuesto. Es posible que no exista.',
            life: 5000,
          });
          this.router.navigate(['/quotes']);
        },
      });
    }
  }

  onBack(): void {
    this.router.navigate(['/quotes']);
  }

  onEdit(): void {
    const id = this.quote()?.id;
    if (id) this.router.navigate(['/quotes', id, 'edit']);
  }

  getStatusLabel(status: QuoteStatus): string {
    return getQuoteStatusLabel(status);
  }

  onAssignWarehouses(): void {
    this.assignDialogVisible.set(true);
  }

  onConvertToOrderFromAssign(_quoteId: string): void {
    this.assignDialogVisible.set(false);
    this.messageService.add({
      severity: 'success',
      summary: 'Almacenes asignados',
      detail: 'Presupuesto listo. Use la lista de presupuestos para convertir a pedido.',
      life: 5000,
    });
  }

  onConvertToInvoiceFromAssign(_quoteId: string): void {
    this.assignDialogVisible.set(false);
    this.messageService.add({
      severity: 'success',
      summary: 'Almacenes asignados',
      detail: 'Presupuesto listo. Use la lista de presupuestos para convertir a factura.',
      life: 5000,
    });
  }

  onAssignFinished(): void {
    this.assignDialogVisible.set(false);
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Almacenes asignados al presupuesto.',
      life: 3000,
    });
  }

  onAssignWarehousesDismissed(): void {
    this.assignDialogVisible.set(false);
  }

  getStatusVariant(status: QuoteStatus): 'success' | 'warning' | 'danger' | 'label' {
    const variants: Record<QuoteStatus, 'success' | 'warning' | 'danger' | 'label'> = {
      [QuoteStatus.DRAFT]: 'label',
      [QuoteStatus.CUSTOMER_DRAFT]: 'warning',
      [QuoteStatus.CANCELLED]: 'danger',
      [QuoteStatus.CONVERTED_TO_ORDER]: 'success',
      [QuoteStatus.CONVERTED_TO_INVOICE]: 'success',
    };
    return variants[status] ?? 'label';
  }
}
