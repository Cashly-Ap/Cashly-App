import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { finalize } from 'rxjs';
import { AccountsPayablePdfModalComponent } from '@features/finance/treasury/payables/reporting/components/accounts-payable-pdf-modal/accounts-payable-pdf-modal.component';
import { AccountsPayableFilters } from '@features/finance/treasury/payables/reporting/models/interfaces';
import { PayablesPdfApiService } from '@features/finance/treasury/payables/reporting/services/api/payables-pdf-api.service';
import { PdfBlobViewerService } from '@shared/services/pdf-blob-viewer.service';
import { ReportActionService } from '@shared/services/report-action.service';

@Component({
  selector: 'app-payable-report-action',
  standalone: true,
  imports: [AccountsPayablePdfModalComponent],
  templateUrl: './payable-report-action.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PayableReportActionComponent {
  private readonly api = inject(PayablesPdfApiService);
  private readonly reports = inject(ReportActionService);
  private readonly viewer = inject(PdfBlobViewerService);

  generate(filters: AccountsPayableFilters): void {
    this.viewer.showLoading('Cuentas por Pagar');
    this.api
      .getAccountsPayablePdf(filters)
      .pipe(finalize(() => this.viewer.loading.set(false)))
      .subscribe({ next: (blob) => this.viewer.open(blob, 'Cuentas por Pagar') });
  }

  close(): void {
    this.reports.close();
  }
}
