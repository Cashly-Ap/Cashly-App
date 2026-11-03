import { LocalizedDatePipe, LocalizedCurrencyPipe } from '@core/i18n/localized-format.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  inject,
  signal,
  effect,
  computed,
} from '@angular/core';
import { UserPreferencesService } from '@core/preferences/user-preferences.service';
import { ReceivableTone, receivableAmountClass } from '../receivables-presentation';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';

import { PaginatorModule } from 'primeng/paginator';

import { ReceivablesApiService } from '@features/finance/treasury/receivables/services/api/receivables-api.service';
import { PendingPayment } from '@features/finance/treasury/receivables/models/interfaces/pending-payment.interface';

import { PanelCardComponent } from '@shared/components/ui/panel-card/panel-card.component';
@Component({
  selector: 'app-payment-history-dialog',
  standalone: true,
  imports: [
    PanelCardComponent,
    TranslatePipe,
    LocalizedDatePipe,
    LocalizedCurrencyPipe,
    DialogModule,
    ButtonModule,
    TableModule,
    PaginatorModule,
  ],
  templateUrl: './payment-history-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentHistoryDialogComponent {
  private apiService = inject(ReceivablesApiService);
  private readonly preferences = inject(UserPreferencesService);

  readonly visible = input.required<boolean>();
  readonly customerId = input.required<string>();
  readonly invoiceId = input<string | null>(null);

  readonly close = output<void>();

  protected payments = signal<PendingPayment[]>([]);
  protected loading = signal(false);

  protected totalAmount = computed(() => this.payments().reduce((sum, p) => sum + p.amount, 0));

  protected approvedCount = computed(
    () => this.payments().filter((p) => p.status === 'APPROVED' || p.status === 'APPLIED').length,
  );

  protected rejectedCount = computed(
    () => this.payments().filter((p) => p.status === 'REJECTED').length,
  );

  constructor() {
    effect((onCleanup) => {
      const customerId = this.customerId();
      const invoiceId = this.invoiceId();
      const isVisible = this.visible();

      this.payments.set([]);
      this.loading.set(false);
      if (!isVisible || !customerId) return;
      this.loading.set(true);
      const request = this.apiService
        .getCustomerPaymentHistory(customerId, {
          page: 0,
          size: 100,
          ...(invoiceId ? { invoiceId } : {}),
        })
        .subscribe({
          next: (response) => {
            this.payments.set(response.content ?? []);
            this.loading.set(false);
          },
          error: () => {
            this.payments.set([]);
            this.loading.set(false);
          },
        });
      onCleanup(() => request.unsubscribe());
    });
  }

  protected onClose(): void {
    this.payments.set([]);
    this.close.emit();
  }

  protected onVisibleChange(isVisible: boolean): void {
    if (!isVisible) {
      this.onClose();
    }
  }

  protected amountColor(tone: ReceivableTone): string {
    return receivableAmountClass(this.preferences.colorMode() === 'informative', tone);
  }
}
