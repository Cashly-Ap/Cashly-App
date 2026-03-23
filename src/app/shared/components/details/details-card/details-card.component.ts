import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-details-card',
  standalone: true,
  templateUrl: './details-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailsCardComponent {}
