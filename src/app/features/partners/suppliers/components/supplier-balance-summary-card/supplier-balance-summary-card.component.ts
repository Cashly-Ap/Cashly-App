import { LocalizedCurrencyPipe } from '@core/i18n/localized-format.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupplierBalanceResponse } from '@features/partners/suppliers/models/interfaces/supplier-balance.interface';

import { PanelCardComponent } from '@shared/components/ui/panel-card/panel-card.component';
@Component({
  selector: 'app-supplier-balance-summary-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PanelCardComponent, TranslatePipe, LocalizedCurrencyPipe, CommonModule],
  templateUrl: './supplier-balance-summary-card.component.html',
})
export class SupplierBalanceSummaryCardComponent {
  readonly supplierBalance = input<SupplierBalanceResponse | null>(null);
  readonly pendingBalance = input(0);
}
