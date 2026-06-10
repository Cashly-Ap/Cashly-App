import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { StockPdfModalComponent } from '../components/stock-pdf-modal';
import { MovementsPdfModalComponent } from '../components/movements-pdf-modal';
import { PdfViewerModalComponent } from '../components/pdf-viewer-modal';
import { StockPdfApiService, StockExcelApiService } from '../services/api';
import { MovementsPdfApiService, MovementsExcelApiService } from '../services/api';
import { FileDownloadHelper } from '@shared/utils/file-download.helper';
import type { StockPdfFilters, MovementsPdfFilters } from '../models/interfaces';

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
      error: () => {
        
      },
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
      error: () => {
        
      },
    });
  }
}
