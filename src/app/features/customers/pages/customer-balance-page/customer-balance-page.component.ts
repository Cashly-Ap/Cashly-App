import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { PageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';
import { LoadingSpinnerComponent } from '@shared/components/ui/loading-spinner/loading-spinner.component';
import { CustomerBalanceApiService } from '@features/customers/services/api/customer-balance-api.service';
import { CustomerApiService } from '@features/customers/services/api/customer-api.service';
import { CustomerBalanceResponse, BalanceTransactionResponse } from '@features/customers/models/interfaces';
import { BalanceSummaryCardComponent } from '@features/customers/components/balance-summary-card/balance-summary-card.component';
import { BalanceTransactionsTableComponent } from '@features/customers/components/balance-transactions-table/balance-transactions-table.component';
import { PagedResponse } from '@shared/models/interfaces/paged-response.interface';

@Component({
  selector: 'app-customer-balance-page',
  standalone: true,
  imports: [
    CommonModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    ButtonModule,
    BalanceSummaryCardComponent,
    BalanceTransactionsTableComponent,
  ],
  templateUrl: './customer-balance-page.component.html',
})
export class CustomerBalancePageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly balanceApi = inject(CustomerBalanceApiService);
  private readonly customerApi = inject(CustomerApiService);
  private readonly messageService = inject(MessageService);

  readonly customerName = signal('');
  readonly customerAlias = signal('');
  readonly balance = signal<CustomerBalanceResponse | null>(null);
  readonly transactions = signal<BalanceTransactionResponse[]>([]);
  readonly loading = signal(true);
  readonly transactionsLoading = signal(false);
  readonly totalRecords = signal(0);
  readonly page = signal(0);
  readonly pageSize = signal(10);

  ngOnInit(): void {
    const customerId = this.route.snapshot.paramMap.get('id');
    if (!customerId) {
      this.router.navigate(['/customers']);
      return;
    }

    this.loadCustomerInfo(customerId);
    this.loadBalance(customerId);
    this.loadTransactions(customerId);
  }

  private loadCustomerInfo(id: string): void {
    this.customerApi.getById(id).subscribe({
      next: (customer) => {
        this.customerName.set(customer.legalName);
        this.customerAlias.set(customer.alias ?? '');
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar la información del cliente.',
          life: 5000,
        });
      },
    });
  }

  private loadBalance(id: string): void {
    this.balanceApi.getBalance(id).subscribe({
      next: (res) => {
        this.balance.set(res);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar el saldo del cliente.',
          life: 5000,
        });
      },
    });
  }

  private loadTransactions(id: string, page = 0, size = 10): void {
    this.transactionsLoading.set(true);
    this.balanceApi.getTransactions(id, page, size).subscribe({
      next: (res: PagedResponse<BalanceTransactionResponse>) => {
        this.transactions.set(res.content);
        this.totalRecords.set(res.totalElements);
        this.page.set(res.number);
        this.pageSize.set(res.size);
        this.transactionsLoading.set(false);
        this.loading.set(false);
      },
      error: () => {
        this.transactionsLoading.set(false);
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los movimientos del cliente.',
          life: 5000,
        });
      },
    });
  }

  onPageChange(event: { first: number; rows: number }): void {
    const customerId = this.route.snapshot.paramMap.get('id');
    if (!customerId) return;

    const newPage = Math.floor(event.first / event.rows);
    this.loadTransactions(customerId, newPage, event.rows);
  }

  onBack(): void {
    const customerId = this.route.snapshot.paramMap.get('id');
    if (customerId) {
      this.router.navigate(['/customers', customerId]);
    } else {
      this.router.navigate(['/customers']);
    }
  }
}
