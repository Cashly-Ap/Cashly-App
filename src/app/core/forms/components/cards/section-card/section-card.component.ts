import { Component, input } from '@angular/core';

@Component({
  selector: 'app-section-card',
  imports: [],
  templateUrl: './section-card.component.html',
})
export class SectionCardComponent {
  colSpan = input<number>(1);
  padding = input<string>('p-4');
}
