import { inject as i18nInject } from '@angular/core';
import { LanguageService as I18nLanguageService } from '@core/i18n/language.service';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputNumberModule, InputNumberInputEvent } from 'primeng/inputnumber';

@Component({
  selector: 'app-number-input',
  imports: [TranslatePipe, ReactiveFormsModule, InputNumberModule],
  templateUrl: './number-input.component.html',
})
export class NumberInputComponent {
  readonly i18nLanguage = i18nInject(I18nLanguageService);
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

  onInput(event: InputNumberInputEvent): void {
    const maxVal = this.max();
    const minVal = this.min();
    if (event.value === null) return;
    if (maxVal !== undefined && event.value > maxVal) {
      this.control().setValue(maxVal, { emitEvent: false });
    } else if (minVal !== undefined && event.value < minVal) {
      this.control().setValue(minVal, { emitEvent: false });
    }
  }
}
