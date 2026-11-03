import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { finalize } from 'rxjs';
import { InvoicePdfModalComponent } from '@features/finance/billing/invoices/reporting/components/invoice-pdf-modal/invoice-pdf-modal.component';
import {
  InvoicePdfApiService,
  InvoicesPdfFilters,
} from '@features/finance/billing/invoices/reporting/services/api/invoice-pdf-api.service';
import { PdfBlobViewerService } from '@shared/services/pdf-blob-viewer.service';
import { ReportActionService } from '@shared/services/report-action.service';

@Component({
  selector: 'app-invoice-report-action',
  standalone: true,
  imports: [InvoicePdfModalComponent],
  templateUrl: './invoice-report-action.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceReportActionComponent {
  private readonly api = inject(InvoicePdfApiService);
  private readonly reports = inject(ReportActionService);
  private readonly viewer = inject(PdfBlobViewerService);

  generate(filters: InvoicesPdfFilters): void {
    this.viewer.showLoading('Reporte de Facturas');
    this.api
      .downloadInvoicesReportPdf(filters)
      .pipe(finalize(() => this.viewer.loading.set(false)))
      .subscribe({ next: (blob) => this.viewer.open(blob, 'Reporte de Facturas') });
  }

  close(): void {
    this.reports.close();
  }
}
