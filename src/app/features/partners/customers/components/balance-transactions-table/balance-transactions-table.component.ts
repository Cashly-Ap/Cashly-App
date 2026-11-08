import { LocalizedDatePipe, LocalizedCurrencyPipe } from '@core/i18n/localized-format.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';

import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { BalanceTransactionResponse } from '@features/partners/customers/models/interfaces/balance-transaction.interface';

const TYPE_KEYS: Record<string, string> = {
  ADVANCED: 'partners.customers.advancePayment',
  RETURNS: 'partners.customers.return',
  PAYMENTS: 'partners.customers.payment',
  INVOICES: 'partners.customers.invoice',
  REFUND: 'partners.customers.refund',
  CREDIT_NOTE: 'partners.customers.creditNote',
  DEBIT_NOTE: 'partners.customers.debitNote',
};

import { PanelCardComponent } from '@shared/components/ui/panel-card/panel-card.component';
import { PaginatorComponent } from '@shared/components/ui/paginator/paginator.component';
import {
  TextBadgeComponent,
  TextBadgeVariant,
} from '@shared/components/ui/text-badge/text-badge.component';
@Component({
  selector: 'app-balance-transactions-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PaginatorComponent,
    PanelCardComponent,
    TextBadgeComponent,
    TranslatePipe,
    LocalizedDatePipe,
    LocalizedCurrencyPipe,
    CommonModule,
    TableModule,
    PaginatorModule,
  ],
  templateUrl: './balance-transactions-table.component.html',
})
export class BalanceTransactionsTableComponent {
  readonly transactions = input<BalanceTransactionResponse[]>([]);
  readonly loading = input(false);
  readonly totalRecords = input(0);
  readonly rows = input(10);
  readonly first = input(0);

  readonly pageChanged = output<{ first: number; rows: number }>();

  onPage(event: { first?: number; rows?: number }): void {
    this.pageChanged.emit({
      first: event.first ?? 0,
      rows: event.rows ?? this.rows(),
    });
  }

  translateType(type: string): string {
    return TYPE_KEYS[type] ?? type;
  }

  typeBadgeVariant(type: string): TextBadgeVariant {
    const variants: Record<string, TextBadgeVariant> = {
      ADVANCED: 'info',
      RETURNS: 'warning',
      PAYMENTS: 'success',
      INVOICES: 'default',
      REFUND: 'danger',
      CREDIT_NOTE: 'success',
      DEBIT_NOTE: 'warning',
    };
    return variants[type] ?? 'secondary';
  }
}
