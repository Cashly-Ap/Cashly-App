import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-tab-content',
  imports: [],
  templateUrl: './tab-content.component.html',
})
export class TabContentComponent {
  columns = input<1 | 2 | 3 | 4>(2);
  gap = input<string>('gap-6');
  padding = input<string>('p-6');

  private columnClasses: Record<1 | 2 | 3 | 4, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  gridClasses = computed(
    () => `${this.padding()} grid ${this.columnClasses[this.columns()]} ${this.gap()}`,
  );
}
