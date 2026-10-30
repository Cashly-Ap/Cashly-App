import { TranslatePipe } from '@core/i18n/translate.pipe';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-details-section-card',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './details-section-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailsSectionCardComponent {
  title = input.required<string>();
  icon = input.required<string>();
}
