import { Component, input } from '@angular/core';

@Component({
  selector: 'app-form-container',
  imports: [],
  templateUrl: './form-container.component.html',
})
export class FormContainerComponent {
  maxWidth = input<string>('max-w-6xl');
}
