import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslatePipe } from '@core/i18n/translate.pipe';

@Component({
  selector: 'app-picker-trigger',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './picker-trigger.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class PickerTriggerComponent {
  readonly labelKey = input.required<string>();
  readonly icon = input('pi pi-search');
  readonly disabled = input(false);

  readonly open = output<void>();
}
