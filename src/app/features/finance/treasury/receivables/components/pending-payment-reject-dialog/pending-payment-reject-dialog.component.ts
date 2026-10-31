import { LocalizedDatePipe } from '@core/i18n/localized-format.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { PermissionDirective } from '@features/platform/auth/authorization/directives/permission.directive';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { MessageService } from 'primeng/api';
import { finalize } from 'rxjs';
import { ReceivablesApiService } from '@features/finance/treasury/receivables/services/api/receivables-api.service';
import { PendingPayment } from '@features/finance/treasury/receivables/models/interfaces/pending-payment.interface';

@Component({
  selector: 'app-pending-payment-reject-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslatePipe,
    LocalizedDatePipe,
    PermissionDirective,
    FormsModule,
    ButtonModule,
    DialogModule,
    TextareaModule,
  ],
  templateUrl: './pending-payment-reject-dialog.component.html',
})
export class PendingPaymentRejectDialogComponent {
  private readonly api = inject(ReceivablesApiService);
  private readonly messages = inject(MessageService);

  readonly visible = model(false);
  readonly payment = input<PendingPayment | null>(null);
  readonly completed = output<void>();

  readonly reason = signal('');
  readonly submitting = signal(false);

  constructor() {
    effect(() => {
      if (!this.visible()) return;
      this.reason.set('');
    });
  }

  submit(): void {
    const payment = this.payment();
    const reason = this.reason().trim();
    if (!payment || !reason) return;

    this.submitting.set(true);
    this.api
      .rejectPayment(payment.id, reason)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          this.visible.set(false);
          this.messages.add({
            severity: 'warn',
            summary: 'Pago rechazado',
            detail: 'El pago ha sido rechazado.',
          });
          this.completed.emit();
        },
        error: () => {
          this.messages.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo rechazar el pago.',
          });
        },
      });
  }
}
