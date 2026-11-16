import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-list-row-skeleton',
  standalone: true,
  imports: [SkeletonModule],
  templateUrl: './list-row-skeleton.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListRowSkeletonComponent {}
