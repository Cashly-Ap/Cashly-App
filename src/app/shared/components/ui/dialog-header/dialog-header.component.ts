import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslatePipe } from '@core/i18n/translate.pipe';

@Component({
  selector: 'app-dialog-header',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './dialog-header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogHeaderComponent {
  readonly icon = input.required<string>();
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
}
