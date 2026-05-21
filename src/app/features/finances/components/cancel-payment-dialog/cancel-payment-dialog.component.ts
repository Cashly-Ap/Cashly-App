import { ChangeDetectionStrategy, Component, OnChanges, input, output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-cancel-payment-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DialogModule, ButtonModule, ReactiveFormsModule, FormsModule, TextareaModule],
  templateUrl: './cancel-payment-dialog.component.html',
})
export class CancelPaymentDialogComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);

  readonly visible = input<boolean>(false);
  readonly paymentId = input<string | null>(null);

  readonly confirmed = output<{ paymentId: string; reason: string }>();
  readonly cancelled = output<void>();

  readonly form: FormGroup = this.fb.group({
    reason: ['', [Validators.required, Validators.maxLength(500)]],
  });

  ngOnChanges(): void {
    if (!this.visible()) {
      this.form.reset();
    }
  }

  onConfirm(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const currentPaymentId = this.paymentId();
    if (!currentPaymentId) return;
    this.confirmed.emit({ paymentId: currentPaymentId, reason: this.form.value.reason.trim() });
  }

  onCancel(): void {
    this.form.reset();
    this.cancelled.emit();
  }

  get reasonInvalid(): boolean {
    const ctrl = this.form.get('reason');
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  get reasonTooLong(): boolean {
    return !!this.form.get('reason')?.hasError('maxlength');
  }
}
