import { Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-form-actions',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './form-actions.component.html',
})
export class FormActionsComponent {
  submitLabel = input<string>('Guardar');
  cancelLabel = input<string>('Cancelar');
  loading = input<boolean>(false);
  disabled = input<boolean>(false);

  cancel = output<void>();
}
