import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { StockPdfModalComponent } from '@features/reports/inventory/components/stock-pdf-modal/stock-pdf-modal.component';
import { MovementsPdfModalComponent } from '@features/reports/inventory/components/movements-pdf-modal/movements-pdf-modal.component';
import { PdfViewerModalComponent } from '@shared/components/pdf-viewer-modal/pdf-viewer-modal.component';
import { StockPdfApiService } from '@features/reports/inventory/services/api/stock-pdf-api.service';
import { StockExcelApiService } from '@features/reports/inventory/services/api/stock-excel-api.service';
import { MovementsPdfApiService } from '@features/reports/inventory/services/api/movements-pdf-api.service';
import { MovementsExcelApiService } from '@features/reports/inventory/services/api/movements-excel-api.service';
import { FileDownloadHelper } from '@shared/utils/file-download.helper';
import type { StockPdfFilters } from '@features/reports/inventory/models/interfaces/stock-pdf-filters.interface';
import type { MovementsPdfFilters } from '@features/reports/inventory/models/interfaces/movements-pdf-filters.interface';

@Component({
  selector: 'app-inventory-reports-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    StockPdfModalComponent,
    MovementsPdfModalComponent,
    PdfViewerModalComponent,
  ],
  templateUrl: './inventory-reports-page.component.html',
})
export default class InventoryReportsPageComponent {
  private readonly stockPdfApi = inject(StockPdfApiService);
  private readonly stockExcelApi = inject(StockExcelApiService);
  private readonly movementsPdfApi = inject(MovementsPdfApiService);
  private readonly movementsExcelApi = inject(MovementsExcelApiService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly stockModalVisible = signal(false);
  readonly movementsModalVisible = signal(false);
  readonly pdfViewerVisible = signal(false);
  readonly pdfLoading = signal(false);
  readonly pdfUrl = signal<SafeResourceUrl | null>(null);
  readonly pdfTitle = signal('');

  onGenerateStockPdf(filters: StockPdfFilters): void {
    this.pdfLoading.set(true);
    this.pdfTitle.set('Stock de Almacenes');
    this.stockPdfApi.getPdf(filters).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        this.pdfUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
        this.pdfLoading.set(false);
        this.stockModalVisible.set(false);
        this.pdfViewerVisible.set(true);
      },
      error: () => {
        this.pdfLoading.set(false);
      },
    });
  }

  onGenerateStockExcel(filters: StockPdfFilters): void {
    this.stockExcelApi.getExcel(filters).subscribe({
      next: (blob) => {
        FileDownloadHelper.downloadFromBlob(blob, 'stock-almacenes.xlsx');
        this.stockModalVisible.set(false);
      },
      error: () => {},
    });
  }

  onGenerateMovementsPdf(filters: MovementsPdfFilters): void {
    this.pdfLoading.set(true);
    this.pdfTitle.set('Historial de Movimientos');
    this.movementsPdfApi.getPdf(filters).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        this.pdfUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
        this.pdfLoading.set(false);
        this.movementsModalVisible.set(false);
        this.pdfViewerVisible.set(true);
      },
      error: () => {
        this.pdfLoading.set(false);
      },
    });
  }

  onGenerateMovementsExcel(filters: MovementsPdfFilters): void {
    this.movementsExcelApi.getExcel(filters).subscribe({
      next: (blob) => {
        FileDownloadHelper.downloadFromBlob(blob, 'historial-movimientos.xlsx');
        this.movementsModalVisible.set(false);
      },
      error: () => {},
    });
  }
}
