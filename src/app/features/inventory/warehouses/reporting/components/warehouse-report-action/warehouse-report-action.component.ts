import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { finalize } from 'rxjs';
import { StockPdfModalComponent } from '@features/inventory/warehouses/reporting/components/stock-pdf-modal/stock-pdf-modal.component';
import { MovementsPdfModalComponent } from '@features/inventory/warehouses/reporting/components/movements-pdf-modal/movements-pdf-modal.component';
import { StockPdfApiService } from '@features/inventory/warehouses/reporting/services/api/stock-pdf-api.service';
import { StockExcelApiService } from '@features/inventory/warehouses/reporting/services/api/stock-excel-api.service';
import { MovementsPdfApiService } from '@features/inventory/warehouses/reporting/services/api/movements-pdf-api.service';
import { MovementsExcelApiService } from '@features/inventory/warehouses/reporting/services/api/movements-excel-api.service';
import { StockPdfFilters } from '@features/inventory/warehouses/reporting/models/interfaces/stock-pdf-filters.interface';
import { MovementsPdfFilters } from '@features/inventory/warehouses/reporting/models/interfaces/movements-pdf-filters.interface';
import { FileDownloadHelper } from '@shared/utils/file-download.helper';
import { PdfBlobViewerService } from '@shared/services/pdf-blob-viewer.service';
import { ReportActionService } from '@shared/services/report-action.service';

@Component({
  selector: 'app-warehouse-report-action',
  standalone: true,
  imports: [StockPdfModalComponent, MovementsPdfModalComponent],
  templateUrl: './warehouse-report-action.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WarehouseReportActionComponent {
  readonly reportKey = input.required<string>();
  private readonly stockPdfApi = inject(StockPdfApiService);
  private readonly stockExcelApi = inject(StockExcelApiService);
  private readonly movementsPdfApi = inject(MovementsPdfApiService);
  private readonly movementsExcelApi = inject(MovementsExcelApiService);
  private readonly reports = inject(ReportActionService);
  private readonly viewer = inject(PdfBlobViewerService);

  stockPdf(filters: StockPdfFilters): void {
    this.viewer.showLoading('Stock de Almacenes');
    this.stockPdfApi
      .getPdf(filters)
      .pipe(finalize(() => this.viewer.loading.set(false)))
      .subscribe({ next: (blob) => this.viewer.open(blob, 'Stock de Almacenes') });
  }

  stockExcel(filters: StockPdfFilters): void {
    this.stockExcelApi
      .getExcel(filters)
      .subscribe({
        next: (blob) => FileDownloadHelper.downloadFromBlob(blob, 'stock-almacenes.xlsx'),
      });
  }

  movementsPdf(filters: MovementsPdfFilters): void {
    this.viewer.showLoading('Historial de Movimientos');
    this.movementsPdfApi
      .getPdf(filters)
      .pipe(finalize(() => this.viewer.loading.set(false)))
      .subscribe({
        next: (blob) => this.viewer.open(blob, 'Historial de Movimientos'),
      });
  }

  movementsExcel(filters: MovementsPdfFilters): void {
    this.movementsExcelApi.getExcel(filters).subscribe({
      next: (blob) => FileDownloadHelper.downloadFromBlob(blob, 'historial-movimientos.xlsx'),
    });
  }

  close(): void {
    this.reports.close();
  }
}
