import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Component, computed, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-checkbox-input',
  imports: [TranslatePipe, ReactiveFormsModule, CheckboxModule],
  templateUrl: './checkbox-input.component.html',
})
export class CheckboxInputComponent {
  label = input.required<string>();
  icon = input<string>();
  control = input<FormControl>();
  colSpan = input<number>(1);

  internalControl = computed(() => this.control() ?? new FormControl(false));
}
