import { Component, input } from '@angular/core';

@Component({
  selector: 'app-form-header',
  standalone: true,
  imports: [],
  templateUrl: './form-header.component.html',
})
export class FormHeaderComponent {
  title = input.required<string>();
  subtitle = input<string>('');
}
