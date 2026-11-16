import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-card-skeleton',
  standalone: true,
  templateUrl: './card-skeleton.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardSkeletonComponent {}
