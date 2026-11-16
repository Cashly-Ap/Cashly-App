import { LocalizedDatePipe, LocalizedCurrencyPipe } from '@core/i18n/localized-format.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';

import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { SupplierBalanceTransactionResponse } from '@features/partners/suppliers/models/interfaces/supplier-balance-transaction.interface';

const TYPE_KEYS: Record<string, string> = {
  ADVANCED: 'partners.suppliers.balanceAdvanced',
  RETURNS: 'partners.suppliers.balanceReturns',
  PAYMENTS: 'partners.suppliers.balancePayments',
  INVOICES: 'partners.suppliers.balancePurchases',
  REFUND: 'partners.suppliers.balanceRefund',
  CREDIT_NOTE: 'partners.suppliers.balanceCreditNote',
  DEBIT_NOTE: 'partners.suppliers.balanceDebitNote',
};

import { PanelCardComponent } from '@shared/components/ui/panel-card/panel-card.component';
import { PaginatorComponent } from '@shared/components/ui/paginator/paginator.component';
import {
  TextBadgeComponent,
  TextBadgeVariant,
} from '@shared/components/ui/text-badge/text-badge.component';
@Component({
  selector: 'app-supplier-balance-transactions-table',
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
  templateUrl: './supplier-balance-transactions-table.component.html',
})
export class SupplierBalanceTransactionsTableComponent {
  readonly transactions = input<SupplierBalanceTransactionResponse[]>([]);
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
