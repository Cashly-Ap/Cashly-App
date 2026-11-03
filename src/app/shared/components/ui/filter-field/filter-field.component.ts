import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslatePipe } from '@core/i18n/translate.pipe';

@Component({
  selector: 'app-filter-field',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './filter-field.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class FilterFieldComponent {
  readonly labelKey = input.required<string>();
}
