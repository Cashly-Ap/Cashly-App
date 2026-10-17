import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { BalanceTransactionResponse } from '@features/partners/customers/models/interfaces/balance-transaction.interface';

const TYPE_TRANSLATIONS: Record<string, string> = {
  ADVANCED: 'Anticipo',
  RETURNS: 'Devolución',
  PAYMENTS: 'Pago',
  INVOICES: 'Factura',
  REFUND: 'Reembolso',
  CREDIT_NOTE: 'Nota de Crédito',
  DEBIT_NOTE: 'Nota de Débito',
};

@Component({
  selector: 'app-balance-transactions-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TableModule, PaginatorModule],
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
    return TYPE_TRANSLATIONS[type] ?? type;
  }

  typeBadgeClass(type: string): string {
    const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    const variants: Record<string, string> = {
      ADVANCED: `${base} bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200`,
      RETURNS: `${base} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`,
      PAYMENTS: `${base} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`,
      INVOICES: `${base} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`,
      REFUND: `${base} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`,
      CREDIT_NOTE: `${base} bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200`,
      DEBIT_NOTE: `${base} bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200`,
    };
    return (
      variants[type] ?? `${base} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200`
    );
  }
}
