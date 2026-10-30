import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Component, input, ChangeDetectionStrategy, computed } from '@angular/core';

export type TextBadgeVariant =
  | 'default'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger'
  | 'secondary'
  | 'label';

@Component({
  selector: 'app-text-badge',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './text-badge.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextBadgeComponent {
  label = input.required<string>();
  variant = input<TextBadgeVariant>('default');

  badgeClass = computed(() => {
    const baseClasses = 'text-xs font-medium px-3 py-1.5 rounded-lg w-fit whitespace-nowrap';

    const variantClasses: Record<TextBadgeVariant, string> = {
      default: 'bg-surface-900 dark:bg-surface-0 text-surface-0 dark:text-surface-900',
      secondary: 'bg-surface-200 dark:bg-surface-700 text-surface-600 dark:text-surface-400',
      info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      success: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
      danger: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
      label: 'bg-surface-100 dark:bg-surface-800 text-surface-500 dark:text-surface-400',
    };

    return `${baseClasses} ${variantClasses[this.variant()]}`;
  });
}
