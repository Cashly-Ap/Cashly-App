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
import {
  PayableTone,
  payableAmountClass,
} from '@features/finance/treasury/payables/components/payables-presentation';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { PayablesApiService } from '@features/finance/treasury/payables/services/api/payables-api.service';
import { SupplierPayment } from '@features/finance/treasury/payables/models/interfaces/supplier-payment.interface';
import { PanelCardComponent } from '@shared/components/ui/panel-card/panel-card.component';
import { PaginatorComponent } from '@shared/components/ui/paginator/paginator.component';

@Component({
  selector: 'app-payment-history-dialog',
  standalone: true,
  imports: [
    PaginatorComponent,
    PanelCardComponent,
    TranslatePipe,
    LocalizedDatePipe,
    LocalizedCurrencyPipe,
    DialogModule,
    ButtonModule,
    TableModule,
  ],
  templateUrl: './payment-history-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentHistoryDialogComponent {
  private readonly apiService = inject(PayablesApiService);
  private readonly preferences = inject(UserPreferencesService);

  readonly visible = input.required<boolean>();
  readonly supplierId = input.required<string>();
  readonly purchaseId = input<string | null>(null);

  readonly close = output<void>();

  protected readonly payments = signal<SupplierPayment[]>([]);
  protected readonly loading = signal(false);

  protected readonly totalAmount = computed(() =>
    this.payments().reduce((sum, payment) => sum + payment.amount, 0),
  );

  protected readonly approvedCount = computed(
    () =>
      this.payments().filter(
        (payment) => payment.status === 'APPROVED' || payment.status === 'APPLIED',
      ).length,
  );

  protected readonly rejectedCount = computed(
    () => this.payments().filter((payment) => payment.status === 'REJECTED').length,
  );

  constructor() {
    effect((onCleanup) => {
      const supplierId = this.supplierId();
      const purchaseId = this.purchaseId();
      const isVisible = this.visible();

      this.payments.set([]);
      this.loading.set(false);
      if (!isVisible || !supplierId) return;

      this.loading.set(true);
      const request = this.apiService
        .getSupplierPaymentHistory(supplierId, {
          page: 0,
          size: 100,
          ...(purchaseId ? { purchaseId } : {}),
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

  protected amountColor(tone: PayableTone): string {
    return payableAmountClass(this.preferences.colorMode() === 'informative', tone);
  }
}
