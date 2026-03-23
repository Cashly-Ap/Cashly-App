import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-details-list-item',
  standalone: true,
  templateUrl: './details-list-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailsListItemComponent {
  icon = input.required<string>();
  value = input.required<string>();
  valueClass = input<string>('');
}
