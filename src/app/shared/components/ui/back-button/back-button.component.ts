import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonModule, ButtonSeverity } from 'primeng/button';
import { TranslatePipe } from '@core/i18n/translate.pipe';

@Component({
  selector: 'app-back-button',
  standalone: true,
  imports: [ButtonModule, TranslatePipe],
  templateUrl: './back-button.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackButtonComponent {
  readonly labelKey = input('finance.billing.creditnotes.back');
  readonly styleClass = input('w-full sm:w-auto');
  readonly severity = input<ButtonSeverity>('secondary');
  readonly outlined = input(true);

  readonly back = output<void>();
}
