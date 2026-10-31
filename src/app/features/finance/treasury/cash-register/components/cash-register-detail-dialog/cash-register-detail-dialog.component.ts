import { LocalizedCurrencyPipe } from '@core/i18n/localized-format.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { ChangeDetectionStrategy, Component, computed, inject, model } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { CashRegisterApplicationService } from '@features/finance/treasury/cash-register/services/application/cash-register-application.service';

@Component({
  selector: 'app-cash-register-detail-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, LocalizedCurrencyPipe, ButtonModule, DialogModule, TableModule],
  templateUrl: './cash-register-detail-dialog.component.html',
})
export class CashRegisterDetailDialogComponent {
  readonly visible = model(false);

  private readonly service = inject(CashRegisterApplicationService);

  readonly details = computed(() => this.service.activeClosure()?.details ?? []);
}
