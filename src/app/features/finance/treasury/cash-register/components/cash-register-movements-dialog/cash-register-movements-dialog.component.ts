import { LocalizedCurrencyPipe, LocalizedDatePipe } from '@core/i18n/localized-format.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CashRegisterResponse } from '@features/finance/treasury/cash-register/models/interfaces/closure.interface';
import { getCashMovementTypeLabel } from '@features/finance/treasury/cash-register/models/enums/cash-movement-type.enum';

@Component({
  selector: 'app-cash-register-movements-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, LocalizedDatePipe, LocalizedCurrencyPipe, ButtonModule, DialogModule],
  templateUrl: './cash-register-movements-dialog.component.html',
})
export class CashRegisterMovementsDialogComponent {
  readonly visible = model(false);
  readonly register = input<CashRegisterResponse | null>(null);
  readonly loading = input(false);

  readonly movements = computed(() => this.register()?.movements ?? []);

  getMovementTypeLabel(type: string): string {
    return getCashMovementTypeLabel(type);
  }
}
