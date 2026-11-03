import { LanguageService } from '@core/i18n/language.service';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SelectInputComponent } from '@core/forms/components/inputs/select-input/select-input.component';
import { countryOptionsFor } from '@core/forms/components/inputs/country-input/country-options';

@Component({
  selector: 'app-country-input',
  standalone: true,
  imports: [TranslatePipe, SelectInputComponent],
  templateUrl: './country-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CountryInputComponent {
  private readonly language = inject(LanguageService);
  readonly control = input.required<FormControl>();
  private readonly currentValue = signal<string | null>(null);
  readonly options = computed(() => countryOptionsFor(this.currentValue()).map((option) => ({ ...option, label: this.language.language() === 'en' && option.code ? option.englishName : option.label })));

  constructor() {
    effect((onCleanup) => {
      const control = this.control();
      this.currentValue.set(control.value);
      const subscription = control.valueChanges.subscribe((value: string | null) =>
        this.currentValue.set(value),
      );
      onCleanup(() => subscription.unsubscribe());
    });
  }
}
