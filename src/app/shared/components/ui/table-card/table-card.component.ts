import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-table-card',
  standalone: true,
  templateUrl: './table-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class TableCardComponent {
  readonly extraClass = input('');
}
