import { TranslatePipe } from '@core/i18n/translate.pipe';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-details-card-header',
  standalone: true,
  imports: [TranslatePipe, CommonModule],
  templateUrl: './details-card-header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailsCardHeaderComponent {
  title = input.required<string>();
  titleClass = input<string>('');
  subtitle = input<string>();
}
