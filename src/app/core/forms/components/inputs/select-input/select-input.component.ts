import { Component, computed, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-select-input',
  imports: [ReactiveFormsModule, SelectModule],
  templateUrl: './select-input.component.html',
})
export class SelectInputComponent {
  label = input.required<string>();
  icon = input<string>();
  placeholder = input<string>('Seleccionar');
  options = input<unknown[]>([]);
  optionLabel = input<string>('label');
  optionValue = input<string>('value');
  control = input<FormControl>();
  colSpan = input<number>();
  errorMessage = input<string>('');

  internalControl = computed(() => this.control() || new FormControl());
}
