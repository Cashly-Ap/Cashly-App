import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@core/i18n/translate.pipe';

@Component({
  selector: 'app-panel-card',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './panel-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class PanelCardComponent {
  readonly padding = input('');
  readonly extraClass = input('');
  readonly overflowHidden = input(false);
  readonly title = input<string>();
  readonly icon = input<string>();

  readonly panelClass = computed(() =>
    [
      'cashly-panel',
      this.overflowHidden() ? 'overflow-hidden' : '',
      this.padding(),
      this.extraClass(),
    ]
      .filter(Boolean)
      .join(' '),
  );
}
