import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@core/i18n/translate.pipe';

@Component({
  selector: 'app-metric-card',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './metric-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class MetricCardComponent {
  readonly labelKey = input.required<string>();
  readonly icon = input('pi pi-chart-line');
  readonly module = input<string | null>(null);
  readonly primary = input(false);

  readonly metricClass = computed(() =>
    [
      'dashboard-metric dashboard-widget rounded-[1.75rem] border border-surface-200',
      'dark:border-surface-800 bg-surface-0 dark:bg-surface-900 p-5 sm:p-6',
      this.primary() ? 'dashboard-metric-primary' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );
}
