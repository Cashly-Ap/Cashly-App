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
  readonly search = output<string>();

  readonly draft = linkedSignal(() => this.value());

  submit(): void {
    this.search.emit(this.draft().trim());
  }

  clear(): void {
    this.draft.set('');
    this.search.emit('');
  }
}
