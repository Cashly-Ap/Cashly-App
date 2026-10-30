import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-list-section',
  standalone: true,
  imports: [TranslatePipe, ButtonModule],
  templateUrl: './list-section.component.html',
})
export class ListSectionComponent {
  title = input.required<string>();
  icon = input<string>('');
  isEmpty = input<boolean>(false);
  emptyIcon = input<string>('');
  emptyMessage = input<string>('No hay elementos registrados');
  addButtonLabel = input<string>('Agregar');
  containerClass = input<string>(
    'bg-surface-50 dark:bg-surface-900 rounded-xl p-4 md:p-6 border border-surface-200 dark:border-surface-700',
  );
  contentClass = input<string>('');

  add = output<void>();
}
