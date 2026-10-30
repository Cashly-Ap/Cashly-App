import { TranslatePipe } from '@core/i18n/translate.pipe';
import { PermissionDirective } from '@features/platform/auth/authorization/directives/permission.directive';
import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-cancel-purchase-dialog',
  standalone: true,
  imports: [
    TranslatePipe,
    PermissionDirective,
    DialogModule,
    ButtonModule,
    FormsModule,
    InputTextModule,
    TextareaModule,
  ],
  templateUrl: './cancel-purchase-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CancelPurchaseDialogComponent {
  readonly visible = input<boolean>(false);
  readonly purchaseNumber = input<string | null>(null);

  readonly confirmed = output<{ reason: string; notes: string }>();
  readonly cancelled = output<void>();

  readonly reason = signal<string>('');
  readonly notes = signal<string>('');

  onConfirm(): void {
    if (!this.reason()) return;
    this.confirmed.emit({ reason: this.reason(), notes: this.notes() });
  }

  onCancel(): void {
    this.resetForm();
    this.cancelled.emit();
  }

  onHide(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.reason.set('');
    this.notes.set('');
  }
}
