import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'tr[app-table-row-skeleton]',
  standalone: true,
  templateUrl: './table-row-skeleton.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableRowSkeletonComponent {
  readonly columns = input(3);
}
