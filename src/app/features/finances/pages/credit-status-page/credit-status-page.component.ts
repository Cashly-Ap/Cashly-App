import { ChangeDetectionStrategy, Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainLayoutComponent } from '@core/layouts/main-layout.component';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { SelectModule } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ContentCardComponent } from '@shared/components/ui/content-card/content-card.component';
import { LoadingSpinnerComponent } from '@shared/components/ui/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '@shared/components/ui/empty-state/empty-state.component';
import { CreditIndicatorComponent } from '../../components/credit-indicator/credit-indicator.component';
import { FinanceApplicationService } from '../../services/application/finance-application.service';
import { CreditApiService } from '../../services/api/credit-api.service';
import { CreditStatus, CustomerBalance } from '../../models/interfaces';

@Component({
  selector: 'app-credit-status-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MainLayoutComponent,
    ButtonModule,
    TableModule,
    SelectModule,
    CardModule,
    TagModule,
    ContentCardComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    CreditIndicatorComponent,
  ],
  templateUrl: './credit-status-page.component.html',
})
export class CreditStatusPageComponent implements OnInit {
  private readonly financeService = inject(FinanceApplicationService);
  private readonly creditApi = inject(CreditApiService);

  readonly creditStatus = this.financeService.creditStatus;
  readonly loadingCredit = this.financeService.loadingCredit;
  readonly customerBalances = signal<CustomerBalance[]>([]);
  readonly selectedCustomerId = signal('');

  readonly showInitialLoading = computed(() => this.loadingCredit() && !this.creditStatus());

  readonly currencyFormat = new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  });

  ngOnInit(): void {
    this.loadCustomerBalances();
  }

  onCustomerChange(customerId: string | null): void {
    const id = customerId ?? '';
    if (!id) return;
    this.selectedCustomerId.set(id);
    this.financeService.loadCreditStatus(id).subscribe();
  }

  loadCustomerBalances(): void {
    this.creditApi.getCustomerBalances().subscribe({
      next: (balances) => this.customerBalances.set(balances),
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-VE');
  }
}
