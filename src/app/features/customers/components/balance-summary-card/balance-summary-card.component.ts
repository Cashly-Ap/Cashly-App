import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { CustomerBalanceResponse } from '../../models/interfaces';

@Component({
  selector: 'app-balance-summary-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, CardModule, ButtonModule],
  templateUrl: './balance-summary-card.component.html',
})
export class BalanceSummaryCardComponent {
  readonly customerBalance = input<CustomerBalanceResponse | null>(null);
  readonly customerName = input<string>('');
  readonly customerAlias = input<string>('');
}
