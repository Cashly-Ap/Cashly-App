import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-details-info-grid',
  standalone: true,
  templateUrl: './details-info-grid.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailsInfoGridComponent {
  readonly columns = input<1 | 2 | 3>(3);
  readonly fillLastRow = input(false);
  readonly gridClasses = computed(() => {
    const columns = this.columns();
    const layout =
      columns === 1
        ? 'grid-cols-1'
        : columns === 2
          ? 'grid-cols-1 sm:grid-cols-2'
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    const fill =
      !this.fillLastRow() || columns === 1
        ? ''
        : columns === 2
          ? 'sm:[&>*:last-child:nth-child(2n+1)]:col-span-full'
          : 'sm:max-lg:[&>*:last-child:nth-child(2n+1)]:col-span-full lg:[&>*:last-child:nth-child(3n+1)]:col-span-full';
    return `grid gap-4 ${layout} ${fill}`;
  });
}
