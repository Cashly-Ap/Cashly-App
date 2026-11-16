import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonModule, ButtonSeverity } from 'primeng/button';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { ShortcutDirective } from '@core/shortcuts/shortcut.directive';

@Component({
  selector: 'app-cancel-button',
  standalone: true,
  imports: [ButtonModule, TranslatePipe, ShortcutDirective],
  templateUrl: './cancel-button.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CancelButtonComponent {
  readonly labelKey = input('shared.cancel');
  readonly label = input<string>();
  readonly icon = input('pi pi-times');
  readonly text = input(false);
  readonly outlined = input(false);
  readonly severity = input<ButtonSeverity>('secondary');
  readonly disabled = input(false);
  readonly loading = input(false);
  readonly styleClass = input('');

  readonly cancelled = output<void>();
}
