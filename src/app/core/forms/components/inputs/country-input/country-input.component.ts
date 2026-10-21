import { ChangeDetectionStrategy, Component, computed, effect, input, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SelectInputComponent } from '../select-input/select-input.component';
import { countryOptionsFor } from './country-options';

@Component({
  selector: 'app-country-input',
  standalone: true,
  imports: [SelectInputComponent],
  templateUrl: './country-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CountryInputComponent {
  readonly control = input.required<FormControl>();
  private readonly currentValue = signal<string | null>(null);
  readonly options = computed(() => countryOptionsFor(this.currentValue()));

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
