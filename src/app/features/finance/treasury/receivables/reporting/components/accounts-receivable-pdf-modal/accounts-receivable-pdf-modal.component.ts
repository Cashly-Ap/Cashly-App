import { TranslateOptionsPipe } from '@core/i18n/translate-options.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { PermissionDirective } from '@features/platform/auth/authorization/directives/permission.directive';
import { ChangeDetectionStrategy, Component, inject, signal, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { AccountsReceivableFilters } from '@features/finance/treasury/receivables/reporting/models/interfaces';
import { CustomerApiService } from '@features/partners/customers/services/api/customer-api.service';

interface SelectOption {
  value: string | null;
  label: string;
}

import { CancelButtonComponent } from '@shared/components/ui/cancel-button/cancel-button.component';
import { ReportPdfModalComponent } from '@shared/components/ui/report-pdf-modal/report-pdf-modal.component';
@Component({
  selector: 'app-accounts-receivable-pdf-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReportPdfModalComponent,
    CancelButtonComponent,
    TranslateOptionsPipe,
    TranslatePipe,
    PermissionDirective,
    CommonModule,
    FormsModule,
    ButtonModule,
    SelectModule,
    CheckboxModule,
  ],
  templateUrl: './accounts-receivable-pdf-modal.component.html',
})
export class AccountsReceivablePdfModalComponent {
  private readonly customerApi = inject(CustomerApiService);

  readonly visible = input(false);
  readonly visibleChange = output<boolean>();
  readonly onGeneratePdf = output<AccountsReceivableFilters>();

  readonly customerId = signal<string | null>(null);
  readonly overdueOnly = signal(false);

  readonly customerOptions = signal<SelectOption[]>([{ value: null, label: 'Todos los clientes' }]);
  private customersLoaded = false;

  loadCustomers(): void {
    if (this.customersLoaded) return;
    this.customersLoaded = true;
    this.customerApi.getAll({ size: 1000 }).subscribe((response) => {
      this.customerOptions.set([
        { value: null, label: 'Todos los clientes' },
        ...(response.content ?? []).map((c) => ({
          value: c.id,
          label: c.legalName,
        })),
      ]);
    });
  }

  onHide(): void {
    this.visibleChange.emit(false);
  }

  generatePdf(): void {
    const filters: AccountsReceivableFilters = {
      customerId: this.customerId() ?? undefined,
      overdueOnly: this.overdueOnly() || undefined,
    };

    this.onGeneratePdf.emit(filters);
  }
}
