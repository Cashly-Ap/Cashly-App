import { LocalizedCurrencyPipe } from '@core/i18n/localized-format.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerBalanceResponse } from '@features/partners/customers/models/interfaces/customer-balance.interface';

@Component({
  selector: 'app-balance-summary-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, LocalizedCurrencyPipe, CommonModule],
  templateUrl: './balance-summary-card.component.html',
})
export class BalanceSummaryCardComponent {
  readonly customerBalance = input<CustomerBalanceResponse | null>(null);
  readonly pendingBalance = input(0);
  readonly customerName = input<string>('');
  readonly customerAlias = input<string>('');
}
