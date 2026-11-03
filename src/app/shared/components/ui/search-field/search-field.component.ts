import { TranslatePipe } from '@core/i18n/translate.pipe';
import { ShortcutDirective } from '@core/shortcuts/shortcut.directive';
import { ChangeDetectionStrategy, Component, input, linkedSignal, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-search-field',
  standalone: true,
  imports: [
    TranslatePipe,
    ShortcutDirective,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    TooltipModule,
  ],
  templateUrl: './search-field.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class SearchFieldComponent {
  readonly value = input('');
  readonly placeholder = input('Buscar...');
  readonly buttonLabel = input('Buscar');
  readonly disabled = input(false);
  readonly live = input(false);
  readonly showButton = input(true);
  readonly submitOnEnter = input(true);
  readonly inputType = input('text');
  readonly ariaLabel = input('');
  readonly role = input<string | null>(null);
  readonly ariaControls = input<string | null>(null);
  readonly ariaExpanded = input<boolean | null>(null);
  readonly ariaActiveDescendant = input<string | null>(null);
  readonly ariaAutocomplete = input<string | null>(null);
  readonly search = output<string>();

  readonly draft = linkedSignal(() => this.value());

  onInput(value: string): void {
    this.draft.set(value);
    if (this.live()) this.search.emit(value);
  }

  onEnter(event: Event): void {
    if (!this.submitOnEnter()) return;
    event.preventDefault();
    this.submit();
  }

  submit(): void {
    this.search.emit(this.draft().trim());
  }

  clear(): void {
    this.draft.set('');
    this.search.emit('');
  }
}
