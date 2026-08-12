import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-field-group',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './field-group.component.html',
})
export class FieldGroupComponent {
  label = input<string>('');
  icon = input<string>('');
  helpText = input<string>('');

  wrapperClass = input<string>('rounded-lg p-3');

  labelClass = input<string>(
    'block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5',
  );

  iconClass = input<string>('text-surface-500 dark:text-surface-400');

  helpClass = input<string>('text-xs text-surface-500 dark:text-surface-400 mt-1');
}
