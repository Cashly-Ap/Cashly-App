import { Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-section-header',
  imports: [ButtonModule],
  templateUrl: './section-header.component.html',
  host: { class: 'block w-full col-span-full' },
})
export class SectionHeaderComponent {
  title = input.required<string>();
  icon = input<string>();
  buttonLabel = input<string>();
  buttonIcon = input<string>();
  buttonDisabled = input<boolean>(false);

  buttonClick = output<void>();
}
