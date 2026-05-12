import { ChangeDetectionStrategy, Component, OnChanges, input, output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { InvoiceList } from '@features/invoices/models/interfaces';

@Component({
  selector: 'app-cancel-invoice-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DialogModule, ButtonModule, ReactiveFormsModule, TextareaModule],
  templateUrl: './cancel-invoice-dialog.component.html',
})
export class CancelInvoiceDialogComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);

  readonly visible = input<boolean>(false);
  readonly invoice = input<InvoiceList | null>(null);

  readonly confirmed = output<{ invoiceId: string; reason: string }>();
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
    const currentInvoice = this.invoice();
    if (!currentInvoice) return;
    this.confirmed.emit({ invoiceId: currentInvoice.id, reason: this.form.value.reason.trim() });
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