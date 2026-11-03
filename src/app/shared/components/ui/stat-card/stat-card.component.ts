import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@core/i18n/translate.pipe';

export type StatCardTone = 'default' | 'success' | 'danger';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './stat-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class StatCardComponent {
  readonly labelKey = input.required<string>();
  readonly tone = input<StatCardTone>('default');
  readonly extraClass = input('');

  readonly valueClass = computed(() => {
    const tone = this.tone();
    if (tone === 'success') return 'text-green-600 dark:text-green-400';
    if (tone === 'danger') return 'text-red-600 dark:text-red-400';
    return '';
  });
}
