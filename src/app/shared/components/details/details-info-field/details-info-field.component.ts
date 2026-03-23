import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

type FieldType = 'text' | 'code' | 'currency' | 'badge';

@Component({
  selector: 'app-details-info-field',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './details-info-field.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailsInfoFieldComponent {
  label = input.required<string>();
  value = input<string | number>();
  type = input<FieldType>('text');
}
