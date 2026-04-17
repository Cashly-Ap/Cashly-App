import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
  selector: 'app-number-input',
  imports: [ReactiveFormsModule, InputNumberModule],
  templateUrl: './number-input.component.html',
})
export class NumberInputComponent {
  label = input.required<string>();
  icon = input<string>();
  helpText = input<string>();
  control = input.required<FormControl>();
  min = input<number>();
  max = input<number>();
  mode = input<'decimal' | 'currency'>();
  prefix = input<string>();
  suffix = input<string>();
  placeholder = input<string>('');
  showButtons = input<boolean>(false);
  minFractionDigits = input<number>();
  maxFractionDigits = input<number>();
  colSpan = input<number>();
  errorMessage = input<string>('');
}
