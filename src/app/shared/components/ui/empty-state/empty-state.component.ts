import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [TranslatePipe, ButtonModule],
  templateUrl: './empty-state.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  icon = input.required<string>();
  title = input<string>();
  message = input.required<string>();
  buttonLabel = input<string>();
  buttonIcon = input<string>('pi pi-plus');
  buttonClick = output<void>();
}
