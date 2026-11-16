import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { finalize } from 'rxjs';
import { OrderPdfModalComponent } from '@features/sales/orders/reporting/components/order-pdf-modal/order-pdf-modal.component';
import {
  OrderPdfApiService,
  OrdersPdfFilters,
} from '@features/sales/orders/reporting/services/api/order-pdf-api.service';
import { PdfBlobViewerService } from '@shared/services/pdf-blob-viewer.service';
import { ReportActionService } from '@shared/services/report-action.service';

@Component({
  selector: 'app-order-report-action',
  standalone: true,
  imports: [OrderPdfModalComponent],
  templateUrl: './order-report-action.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderReportActionComponent {
  private readonly api = inject(OrderPdfApiService);
  private readonly reports = inject(ReportActionService);
  private readonly viewer = inject(PdfBlobViewerService);

  generate(filters: OrdersPdfFilters): void {
    this.viewer.showLoading('Reporte de Pedidos');
    this.api
      .downloadOrdersReportPdf(filters)
      .pipe(finalize(() => this.viewer.loading.set(false)))
      .subscribe({ next: (blob) => this.viewer.open(blob, 'Reporte de Pedidos') });
  }

  close(): void {
    this.reports.close();
  }
}
