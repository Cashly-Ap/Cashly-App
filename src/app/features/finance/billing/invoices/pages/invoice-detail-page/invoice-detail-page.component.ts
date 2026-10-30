import { LocalizedDatePipe, LocalizedNumberPipe } from '@core/i18n/localized-format.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { NavigationHistoryService } from '@core/navigation/navigation-history.service';
import { PermissionDirective } from '@features/platform/auth/authorization/directives/permission.directive';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { DetailActionsMenuComponent } from '@shared/components/details/detail-actions-menu/detail-actions-menu.component';
import { DetailsCardComponent } from '@shared/components/details/details-card/details-card.component';
import { DetailsCardHeaderComponent } from '@shared/components/details/details-card-header/details-card-header.component';
import { DetailsInfoFieldComponent } from '@shared/components/details/details-info-field/details-info-field.component';
import { DetailsInfoGridComponent } from '@shared/components/details/details-info-grid/details-info-grid.component';
import { DetailsSectionCardComponent } from '@shared/components/details/details-section-card/details-section-card.component';
import { EmptyStateComponent } from '@shared/components/ui/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '@shared/components/ui/loading-spinner/loading-spinner.component';
import { PageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';
import { TextBadgeComponent } from '@shared/components/ui/text-badge/text-badge.component';
import { DuplicateInvoiceDialogComponent } from '@features/finance/billing/invoices/components/duplicate-invoice-dialog/duplicate-invoice-dialog.component';
import { InvoiceApplicationService } from '@features/finance/billing/invoices/services/application/invoice-application.service';
import {
  InvoiceStatus,
  getInvoiceStatusLabel,
} from '@features/finance/billing/invoices/models/enums/invoice-status.enum';
import {
  PaymentType,
  getPaymentTypeLabel,
} from '@features/finance/billing/invoices/models/enums/payment-type.enum';

@Component({
  selector: 'app-invoice-detail-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslatePipe,
    LocalizedDatePipe,
    LocalizedNumberPipe,
    PermissionDirective,
    DatePipe,
    DecimalPipe,
    ButtonModule,
    TableModule,
    DetailActionsMenuComponent,
    DetailsCardComponent,
    DetailsCardHeaderComponent,
    DetailsInfoFieldComponent,
    DetailsInfoGridComponent,
    DetailsSectionCardComponent,
    EmptyStateComponent,
    LoadingSpinnerComponent,
    PageHeaderComponent,
    TextBadgeComponent,
    DuplicateInvoiceDialogComponent,
  ],
  templateUrl: './invoice-detail-page.component.html',
})
export class InvoiceDetailPageComponent implements OnInit {
  private readonly navigationHistory = inject(NavigationHistoryService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly invoiceService = inject(InvoiceApplicationService);
  private readonly messageService = inject(MessageService);

  readonly invoice = this.invoiceService.currentInvoice;
  readonly loading = this.invoiceService.loading;

  readonly creditNotes = computed(
    () => this.invoice()?.notesList?.filter((n) => n.type === 'CREDIT') ?? [],
  );
  readonly debitNotes = computed(
    () => this.invoice()?.notesList?.filter((n) => n.type === 'DEBIT') ?? [],
  );

  readonly InvoiceStatus = InvoiceStatus;

  readonly duplicateDialogVisible = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.invoiceService.loadById(id).subscribe({
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar la factura. Es posible que no exista.',
            life: 5000,
          });
          this.router.navigate(['/finance/billing/invoices']);
        },
      });
    }
  }

  onBack(): void {
    this.navigationHistory.back(['/finance/billing/invoices']);
  }

  onEdit(): void {
    const id = this.invoice()?.id;
    if (id) this.router.navigate(['/finance/billing/invoices', id, 'edit']);
  }

  onDuplicate(): void {
    this.duplicateDialogVisible.set(true);
  }

  onDuplicateDialogConfirmed(event: { invoiceId: string; customerId?: string }): void {
    this.duplicateDialogVisible.set(false);
    this.invoiceService.duplicate(event.invoiceId, event.customerId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Factura duplicada exitosamente',
          life: 3000,
        });
        this.router.navigate(['/finance/billing/invoices']);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al duplicar la factura. Por favor, intente nuevamente.',
          life: 5000,
        });
      },
    });
  }

  onDuplicateDialogDismissed(): void {
    this.duplicateDialogVisible.set(false);
  }

  getStatusLabel(status: InvoiceStatus): string {
    return getInvoiceStatusLabel(status);
  }

  getStatusVariant(status: InvoiceStatus): 'success' | 'danger' | 'info' | 'label' | 'warning' {
    const variants: Record<InvoiceStatus, 'success' | 'danger' | 'info' | 'label' | 'warning'> = {
      [InvoiceStatus.DRAFT]: 'label',
      [InvoiceStatus.PENDING_PAYMENT]: 'info',
      [InvoiceStatus.PARTIALLY_PAID]: 'info',
      [InvoiceStatus.PAID]: 'success',
      [InvoiceStatus.CANCELLED]: 'danger',
      [InvoiceStatus.FULLY_RETURNED]: 'info',
    };
    return variants[status] ?? 'label';
  }

  getReturnStatusLabel(returnStatus: string | null): string {
    const labels: Record<string, string> = {
      PARTIAL: 'Parcialmente Devuelta',
      FULL: 'Totalmente Devuelta',
    };
    return returnStatus ? (labels[returnStatus] ?? '') : '';
  }

  getReturnStatusVariant(returnStatus: string | null): 'warning' | 'info' | undefined {
    if (returnStatus === 'PARTIAL') return 'warning';
    if (returnStatus === 'FULL') return 'info';
    return undefined;
  }

  canCancel(status: InvoiceStatus): boolean {
    return (
      status !== InvoiceStatus.DRAFT &&
      status !== InvoiceStatus.CANCELLED &&
      status !== InvoiceStatus.PAID &&
      status !== InvoiceStatus.FULLY_RETURNED
    );
  }

  getPaymentTypeLabel(paymentType: PaymentType): string {
    return getPaymentTypeLabel(paymentType);
  }
}
