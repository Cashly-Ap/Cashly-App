import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';

@Component({
  selector: 'app-text-input',
  standalone: true,
  imports: [TranslatePipe, NgClass, ReactiveFormsModule, InputTextModule, PasswordModule],
  templateUrl: './text-input.component.html',
})
export class TextInputComponent {
  control = input.required<FormControl>();
  label = input.required<string>();
  placeholder = input<string>('');
  errorMessage = input<string>('');
  variant = input<'text' | 'password'>('text');
  readonly = input<boolean>(false);
  containerClass = input<string>('');
}
