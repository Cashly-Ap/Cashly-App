import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { finalize } from 'rxjs';
import { CashRegisterReportModalComponent } from '@features/finance/treasury/cash-register/reporting/components/cash-register-report-modal/cash-register-report-modal.component';
import { CashRegisterReportFilters } from '@features/finance/treasury/cash-register/reporting/models/interfaces';
import { CashRegisterApiService } from '@features/finance/treasury/cash-register/services/api/cash-register-api.service';
import { FileDownloadHelper } from '@shared/utils/file-download.helper';
import { PdfBlobViewerService } from '@shared/services/pdf-blob-viewer.service';
import { ReportActionService } from '@shared/services/report-action.service';

@Component({
  selector: 'app-cash-register-report-action',
  standalone: true,
  imports: [CashRegisterReportModalComponent],
  templateUrl: './cash-register-report-action.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashRegisterReportActionComponent {
  private readonly api = inject(CashRegisterApiService);
  private readonly reports = inject(ReportActionService);
  private readonly viewer = inject(PdfBlobViewerService);

  generate(filters: CashRegisterReportFilters): void {
    const baseName = `caja-${filters.dateFrom}-${filters.dateTo}-${filters.type.toLowerCase()}`;
    if (filters.format === 'PDF') this.viewer.showLoading('Reporte de Caja');
    this.api
      .exportReport(filters)
      .pipe(finalize(() => this.viewer.loading.set(false)))
      .subscribe({
        next: (blob) => {
          if (filters.format === 'EXCEL') {
            FileDownloadHelper.downloadFromBlob(blob, `${baseName}.xlsx`);
            return;
          }
          this.viewer.open(blob, 'Reporte de Caja');
        },
      });
  }

  close(): void {
    this.reports.close();
  }
}
