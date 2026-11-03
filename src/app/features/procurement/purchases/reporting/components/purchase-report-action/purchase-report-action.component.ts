import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { finalize } from 'rxjs';
import { PurchasePdfModalComponent } from '@features/procurement/purchases/reporting/components/purchase-pdf-modal/purchase-pdf-modal.component';
import {
  PurchasePdfApiService,
  PurchasesPdfFilters,
} from '@features/procurement/purchases/reporting/services/api/purchase-pdf-api.service';
import { PdfBlobViewerService } from '@shared/services/pdf-blob-viewer.service';
import { ReportActionService } from '@shared/services/report-action.service';

@Component({
  selector: 'app-purchase-report-action',
  standalone: true,
  imports: [PurchasePdfModalComponent],
  templateUrl: './purchase-report-action.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PurchaseReportActionComponent {
  private readonly api = inject(PurchasePdfApiService);
  private readonly reports = inject(ReportActionService);
  private readonly viewer = inject(PdfBlobViewerService);

  generate(filters: PurchasesPdfFilters): void {
    this.viewer.showLoading('Reporte de Compras');
    this.api
      .downloadPurchasesReportPdf(filters)
      .pipe(finalize(() => this.viewer.loading.set(false)))
      .subscribe({ next: (blob) => this.viewer.open(blob, 'Reporte de Compras') });
  }

  close(): void {
    this.reports.close();
  }
}
