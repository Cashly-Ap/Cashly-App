import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { finalize } from 'rxjs';
import { AccountsReceivablePdfModalComponent } from '@features/finance/treasury/receivables/reporting/components/accounts-receivable-pdf-modal/accounts-receivable-pdf-modal.component';
import { AccountsReceivableFilters } from '@features/finance/treasury/receivables/reporting/models/interfaces';
import { ReceivablesPdfApiService } from '@features/finance/treasury/receivables/reporting/services/api/receivables-pdf-api.service';
import { PdfBlobViewerService } from '@shared/services/pdf-blob-viewer.service';
import { ReportActionService } from '@shared/services/report-action.service';

@Component({
  selector: 'app-receivable-report-action',
  standalone: true,
  imports: [AccountsReceivablePdfModalComponent],
  templateUrl: './receivable-report-action.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReceivableReportActionComponent {
  private readonly api = inject(ReceivablesPdfApiService);
  private readonly reports = inject(ReportActionService);
  private readonly viewer = inject(PdfBlobViewerService);

  generate(filters: AccountsReceivableFilters): void {
    this.viewer.showLoading('Cuentas por Cobrar');
    this.api
      .getAccountsReceivablePdf(filters)
      .pipe(finalize(() => this.viewer.loading.set(false)))
      .subscribe({ next: (blob) => this.viewer.open(blob, 'Cuentas por Cobrar') });
  }

  close(): void {
    this.reports.close();
  }
}
