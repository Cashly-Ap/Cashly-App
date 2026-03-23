import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-details-info-grid',
  standalone: true,
  templateUrl: './details-info-grid.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailsInfoGridComponent {}
