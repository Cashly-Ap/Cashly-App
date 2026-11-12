import { TranslateOptionsPipe } from '@core/i18n/translate-options.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { PermissionDirective } from '@features/platform/auth/authorization/directives/permission.directive';
import { ChangeDetectionStrategy, Component, inject, signal, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { AccountsPayableFilters } from '@features/finance/treasury/payables/reporting/models/interfaces';
import { SupplierApiService } from '@features/partners/suppliers/services/api/supplier-api.service';
import { CancelButtonComponent } from '@shared/components/ui/cancel-button/cancel-button.component';
import { ReportPdfModalComponent } from '@shared/components/ui/report-pdf-modal/report-pdf-modal.component';

interface SelectOption {
  value: string | null;
  label: string;
}

@Component({
  selector: 'app-accounts-payable-pdf-modal',
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
  templateUrl: './accounts-payable-pdf-modal.component.html',
})
export class AccountsPayablePdfModalComponent {
  private readonly supplierApi = inject(SupplierApiService);

  readonly visible = input(false);
  readonly visibleChange = output<boolean>();
  readonly onGeneratePdf = output<AccountsPayableFilters>();

  readonly supplierId = signal<string | null>(null);
  readonly overdueOnly = signal(false);

  readonly supplierOptions = signal<SelectOption[]>([
    { value: null, label: 'finance.treasury.payables.allSuppliers' },
  ]);
  private suppliersLoaded = false;

  loadSuppliers(): void {
    if (this.suppliersLoaded) return;
    this.suppliersLoaded = true;
    this.supplierApi.getAll({ size: 1000 }).subscribe((response) => {
      this.supplierOptions.set([
        { value: null, label: 'finance.treasury.payables.allSuppliers' },
        ...(response.content ?? []).map((supplier) => ({
          value: supplier.id,
          label: supplier.legalName,
        })),
      ]);
    });
  }

  onHide(): void {
    this.visibleChange.emit(false);
  }

  generatePdf(): void {
    const filters: AccountsPayableFilters = {
      supplierId: this.supplierId() ?? undefined,
      overdueOnly: this.overdueOnly() || undefined,
    };

    this.onGeneratePdf.emit(filters);
  }
}
