import { Component, input, output } from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';
import { CancelButtonComponent } from '@shared/components/ui/cancel-button/cancel-button.component';

import { SubmitButtonComponent } from '@shared/components/ui/submit-button/submit-button.component';
@Component({
  selector: 'app-form-actions',
  standalone: true,
  imports: [SubmitButtonComponent, TooltipModule, CancelButtonComponent],
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
