import { TranslatePipe } from '@core/i18n/translate.pipe';
import { ShortcutDirective } from '@core/shortcuts/shortcut.directive';
import { Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { CancelButtonComponent } from '@shared/components/ui/cancel-button/cancel-button.component';

@Component({
  selector: 'app-form-actions',
  standalone: true,
  imports: [TranslatePipe, ShortcutDirective, ButtonModule, TooltipModule, CancelButtonComponent],
  templateUrl: './form-actions.component.html',
})
export class FormActionsComponent {
  submitLabel = input<string>('Guardar');
  cancelLabel = input<string>('Cancelar');
  loading = input<boolean>(false);
  disabled = input<boolean>(false);
  tooltipMessage = input<string>('');

  cancel = output<void>();
}
