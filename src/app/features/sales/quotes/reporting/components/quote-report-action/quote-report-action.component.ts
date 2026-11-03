import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { finalize } from 'rxjs';
import { QuotePdfModalComponent } from '@features/sales/quotes/reporting/components/quote-pdf-modal/quote-pdf-modal.component';
import {
  QuotePdfApiService,
  QuotesPdfFilters,
} from '@features/sales/quotes/reporting/services/api/quote-pdf-api.service';
import { PdfBlobViewerService } from '@shared/services/pdf-blob-viewer.service';
import { ReportActionService } from '@shared/services/report-action.service';

@Component({
  selector: 'app-quote-report-action',
  standalone: true,
  imports: [QuotePdfModalComponent],
  templateUrl: './quote-report-action.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuoteReportActionComponent {
  private readonly api = inject(QuotePdfApiService);
  private readonly reports = inject(ReportActionService);
  private readonly viewer = inject(PdfBlobViewerService);

  generate(filters: QuotesPdfFilters): void {
    this.viewer.showLoading('Reporte de Presupuestos');
    this.api
      .downloadQuotesReportPdf(filters)
      .pipe(finalize(() => this.viewer.loading.set(false)))
      .subscribe({ next: (blob) => this.viewer.open(blob, 'Reporte de Presupuestos') });
  }

  close(): void {
    this.reports.close();
  }
}
