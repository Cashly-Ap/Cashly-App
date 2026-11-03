import { LocalizedDatePipe, LocalizedNumberPipe } from '@core/i18n/localized-format.pipe';
import { StatusVariant } from '@shared/models/status-variant';
import { quoteStatusVariant } from '@features/sales/quotes/models/quote-status.presentation';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { NavigationHistoryService } from '@core/navigation/navigation-history.service';
import { PermissionDirective } from '@features/platform/auth/authorization/directives/permission.directive';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { DetailActionsMenuComponent } from '@shared/components/details/detail-actions-menu/detail-actions-menu.component';

import { DetailsCardHeaderComponent } from '@shared/components/details/details-card-header/details-card-header.component';
import { DetailsInfoFieldComponent } from '@shared/components/details/details-info-field/details-info-field.component';
import { DetailsInfoGridComponent } from '@shared/components/details/details-info-grid/details-info-grid.component';

import { EmptyStateComponent } from '@shared/components/ui/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '@shared/components/ui/loading-spinner/loading-spinner.component';
import { PageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';
import { TextBadgeComponent } from '@shared/components/ui/text-badge/text-badge.component';
import { QuoteApplicationService } from '@features/sales/quotes/services/application/quote-application.service';
import {
  QuoteStatus,
  getQuoteStatusLabel,
} from '@features/sales/quotes/models/enums/quote-status.enum';

import { PanelCardComponent } from '@shared/components/ui/panel-card/panel-card.component';
import { BackButtonComponent } from '@shared/components/ui/back-button/back-button.component';
import { CodeBadgeComponent } from '@shared/components/ui/code-badge/code-badge.component';
import { ConvertToOrderDialogComponent } from '@features/sales/quotes/components/convert-to-order-dialog/convert-to-order-dialog.component';
import { ConvertToInvoiceDialogComponent } from '@features/sales/quotes/components/convert-to-invoice-dialog/convert-to-invoice-dialog.component';
import { DeleteDialogService } from '@shared/services/delete-dialog.service';
import { CancelDialogService } from '@shared/services/cancel-dialog.service';
import { PdfViewerService } from '@core/pdf-viewer';
import { ConvertToInvoiceRequest } from '@features/sales/quotes/services/api/quote-api.service';
import { QuoteList } from '@features/sales/quotes/models/interfaces/quote-list.interface';
import { computed, signal } from '@angular/core';
@Component({
  selector: 'app-quote-detail-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CodeBadgeComponent,
    BackButtonComponent,
    PanelCardComponent,
    TranslatePipe,
    LocalizedDatePipe,
    LocalizedNumberPipe,
    PermissionDirective,
    ButtonModule,
    TableModule,
    DetailActionsMenuComponent,
    DetailsCardHeaderComponent,
    DetailsInfoFieldComponent,
    DetailsInfoGridComponent,
    EmptyStateComponent,
    LoadingSpinnerComponent,
    PageHeaderComponent,
    TextBadgeComponent,
    ConvertToOrderDialogComponent,
    ConvertToInvoiceDialogComponent,
  ],
  templateUrl: './quote-detail-page.component.html',
})
export class QuoteDetailPageComponent implements OnInit {
  private readonly navigationHistory = inject(NavigationHistoryService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly quoteService = inject(QuoteApplicationService);
  private readonly messageService = inject(MessageService);
  private readonly deletion = inject(DeleteDialogService);
  private readonly cancellation = inject(CancelDialogService);
  private readonly pdfViewerService = inject(PdfViewerService);

  readonly quote = this.quoteService.currentQuote;
  readonly loading = this.quoteService.loading;

  readonly QuoteStatus = QuoteStatus;
  readonly orderDialogVisible = signal(false);
  readonly invoiceDialogVisible = signal(false);
  readonly quoteForDialog = computed(() => this.quote() as unknown as QuoteList | null);

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
          this.router.navigate(['/sales/quotes']);
        },
      });
    }
  }

  onDownloadPdf(): void {
    const quote = this.quote();
    if (!quote) return;
    this.pdfViewerService.open({
      url: `/api/reports/quotes/${quote.id}/pdf`,
      title: `Presupuesto #${quote.quoteNumber}`,
      fileName: `presupuesto-${quote.quoteNumber}.pdf`,
    });
  }

  onConvertToOrder(): void {
    this.orderDialogVisible.set(true);
  }

  onOrderDialogConfirmed(): void {
    const quote = this.quote();
    if (!quote) return;
    this.orderDialogVisible.set(false);
    this.quoteService.convertToOrder(quote.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `Presupuesto #${quote.quoteNumber} convertido a pedido exitosamente`,
          life: 3000,
        });
        this.quoteService.loadById(quote.id).subscribe();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al convertir el presupuesto a pedido. Por favor, intente nuevamente.',
          life: 5000,
        });
      },
    });
  }

  onOrderDialogDismissed(): void {
    this.orderDialogVisible.set(false);
  }

  onConvertToInvoice(): void {
    this.invoiceDialogVisible.set(true);
  }

  onInvoiceDialogConfirmed(request: ConvertToInvoiceRequest): void {
    const quote = this.quote();
    if (!quote) return;
    this.invoiceDialogVisible.set(false);
    this.quoteService.convertToInvoice(quote.id, request).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `Presupuesto #${quote.quoteNumber} convertido a factura exitosamente`,
          life: 3000,
        });
        this.quoteService.loadById(quote.id).subscribe();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al convertir el presupuesto a factura. Por favor, intente nuevamente.',
          life: 5000,
        });
      },
    });
  }

  onInvoiceDialogDismissed(): void {
    this.invoiceDialogVisible.set(false);
  }

  onCancelQuote(): void {
    const quote = this.quote();
    if (!quote) return;
    this.cancellation.open('quotes', quote.id, quote.quoteNumber, () =>
      this.quoteService.loadById(quote.id).subscribe(),
    );
  }

  onDelete(): void {
    const quote = this.quote();
    if (!quote) return;
    this.deletion.open('quotes', quote.id, quote.quoteNumber, () =>
      this.router.navigate(['/sales/quotes']),
    );
  }

  onBack(): void {
    this.navigationHistory.back(['/sales/quotes']);
  }

  onEdit(): void {
    const id = this.quote()?.id;
    if (id) this.router.navigate(['/sales/quotes', id, 'edit']);
  }

  getStatusLabel(status: QuoteStatus): string {
    return getQuoteStatusLabel(status);
  }

  getStatusVariant(status: QuoteStatus): StatusVariant {
    return quoteStatusVariant(status);
  }
}
