import { ChangeDetectionStrategy, Component, OnChanges, input, output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { QuoteList } from '@features/quotes/models/interfaces';

@Component({
  selector: 'app-cancel-quote-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DialogModule, ButtonModule, ReactiveFormsModule, TextareaModule],
  templateUrl: './cancel-quote-dialog.component.html',
})
export class CancelQuoteDialogComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);

  readonly visible = input<boolean>(false);
  readonly quote = input<QuoteList | null>(null);

  readonly confirmed = output<{ quoteId: string; reason: string }>();
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
    const currentQuote = this.quote();
    if (!currentQuote) return;
    this.confirmed.emit({ quoteId: currentQuote.id, reason: this.form.value.reason.trim() });
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
