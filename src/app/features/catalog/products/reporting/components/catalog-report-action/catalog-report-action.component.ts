import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { finalize } from 'rxjs';
import { CatalogPdfApiService } from '@features/catalog/products/reporting/services/api/catalog-pdf-api.service';
import { CommercialCatalogPdfApiService } from '@features/catalog/products/reporting/services/api/commercial-catalog-pdf-api.service';
import { CatalogPdfModalComponent } from '@features/catalog/products/reporting/components/catalog-pdf-modal/catalog-pdf-modal.component';
import { CommercialCatalogPdfModalComponent } from '@features/catalog/products/reporting/components/commercial-catalog-pdf-modal/commercial-catalog-pdf-modal.component';
import { CatalogPdfFilters } from '@features/catalog/products/reporting/models/interfaces/catalog-pdf-filters.interface';
import { CommercialCatalogPdfFilters } from '@features/catalog/products/reporting/models/interfaces/commercial-catalog-pdf-filters.interface';
import { PdfBlobViewerService } from '@shared/services/pdf-blob-viewer.service';
import { ReportActionService } from '@shared/services/report-action.service';

@Component({
  selector: 'app-catalog-report-action',
  standalone: true,
  imports: [CatalogPdfModalComponent, CommercialCatalogPdfModalComponent],
  templateUrl: './catalog-report-action.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogReportActionComponent {
  readonly reportKey = input.required<string>();
  private readonly catalogApi = inject(CatalogPdfApiService);
  private readonly commercialApi = inject(CommercialCatalogPdfApiService);
  private readonly reports = inject(ReportActionService);
  private readonly viewer = inject(PdfBlobViewerService);

  catalog(filters: CatalogPdfFilters): void {
    this.viewer.showLoading('Reporte de Productos');
    this.catalogApi
      .downloadPdf(filters)
      .pipe(finalize(() => this.viewer.loading.set(false)))
      .subscribe({ next: (blob) => this.viewer.open(blob, 'Reporte de Productos') });
  }

  commercial(filters: CommercialCatalogPdfFilters): void {
    this.viewer.showLoading('Catálogo Comercial');
    this.commercialApi
      .downloadPdf(filters)
      .pipe(finalize(() => this.viewer.loading.set(false)))
      .subscribe({ next: (blob) => this.viewer.open(blob, 'Catálogo Comercial') });
  }

  close(): void {
    this.reports.close();
  }
}
