import { TranslatePipe } from '@core/i18n/translate.pipe';
import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { CancelDialogService } from '@shared/services/cancel-dialog.service';

@Component({
  selector: 'app-cancel-dialog',
  standalone: true,
  imports: [TranslatePipe, DialogModule, ButtonModule, ReactiveFormsModule, TextareaModule],
  templateUrl: './cancel-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CancelDialogComponent {
  readonly cancellation = inject(CancelDialogService);
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({
    reason: ['', [Validators.required, Validators.maxLength(500)]],
  });

  constructor() {
    effect(() => {
      if (!this.cancellation.request()) this.form.reset();
    });
  }

  confirm(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const reason = this.form.value.reason?.trim();
    if (!reason) return;
    this.cancellation.confirm(reason);
  }

  close(): void {
    this.form.reset();
    this.cancellation.close();
  }

  get reasonInvalid(): boolean {
    const control = this.form.get('reason');
    return !!(control?.invalid && control?.touched);
  }

  get reasonTooLong(): boolean {
    return !!this.form.get('reason')?.hasError('maxlength');
  }
}
