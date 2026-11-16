import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-metric-skeleton',
  standalone: true,
  imports: [SkeletonModule],
  templateUrl: './metric-skeleton.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricSkeletonComponent {}
