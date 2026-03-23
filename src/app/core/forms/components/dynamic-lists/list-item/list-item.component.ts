import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-list-item',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule],
  templateUrl: './list-item.component.html',
})
export class ListItemComponent {
  control = input.required<FormControl>();
  placeholder = input<string>('');
  icon = input<string>('');
  inputType = input<string>('text');
  errorMessages = input<Record<string, string>>({});

  remove = output<void>();

  displayError = computed(() => {
    const ctrl = this.control();
    if (!ctrl.errors || !ctrl.touched) {
      return '';
    }

    const messages = this.errorMessages();
    const errorKeys = Object.keys(ctrl.errors);

    for (const key of errorKeys) {
      if (messages[key]) {
        return messages[key];
      }
      const error = ctrl.errors[key];
      if (error && typeof error === 'object' && 'message' in error) {
        return error.message;
      }
    }

    return '';
  });
}
