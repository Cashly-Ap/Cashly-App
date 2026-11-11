import { TranslatePipe } from '@core/i18n/translate.pipe';
import { PermissionDirective } from '@features/platform/auth/authorization/directives/permission.directive';
import {
  ChangeDetectionStrategy,
  Component,
  OnChanges,
  inject,
  input,
  output,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { CancelButtonComponent } from '@shared/components/ui/cancel-button/cancel-button.component';
import { Expense } from '@features/finance/treasury/expenses/models/interfaces/expense.interface';

@Component({
  selector: 'app-expense-cancel-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CancelButtonComponent,
    TranslatePipe,
    PermissionDirective,
    DialogModule,
    ButtonModule,
    ReactiveFormsModule,
    TextareaModule,
  ],
  templateUrl: './expense-cancel-dialog.component.html',
})
export class ExpenseCancelDialogComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);

  readonly visible = input<boolean>(false);
  readonly expense = input<Expense | null>(null);

  readonly confirmed = output<{ id: string; reason: string }>();
  readonly cancelled = output<void>();

  readonly form: FormGroup = this.fb.group({
    reason: ['', [Validators.required, Validators.maxLength(500)]],
  });

  ngOnChanges(): void {
    if (!this.visible()) {
      this.form.reset();
    }
  }

  get reasonInvalid(): boolean {
    const control = this.form.get('reason');
    return !!(control?.invalid && control?.touched);
  }

  get reasonTooLong(): boolean {
    return !!this.form.get('reason')?.hasError('maxlength');
  }

  onConfirm(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const current = this.expense();
    if (!current) return;
    this.confirmed.emit({ id: current.id, reason: this.form.value.reason.trim() });
  }

  onCancel(): void {
    this.form.reset();
    this.cancelled.emit();
  }
}
