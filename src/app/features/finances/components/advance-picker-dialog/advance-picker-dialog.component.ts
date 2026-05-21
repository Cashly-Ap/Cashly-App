import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { TextBadgeComponent } from '@shared/components/ui/text-badge/text-badge.component';
import { Advance } from '@features/finances/models/interfaces';
import { getPaymentStatusLabel } from '@features/finances/models/enums/payment-status.enum';
import { PaymentStatus } from '@features/finances/models/enums/payment-status.enum';

@Component({
  selector: 'app-advance-picker-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    TableModule,
    InputNumberModule,
    SelectModule,
    TextBadgeComponent,
  ],
  templateUrl: './advance-picker-dialog.component.html',
})
export class AdvancePickerDialogComponent {
  private readonly fb = inject(FormBuilder);

  readonly visible = input<boolean>(false);
  readonly customerId = input<string | null>(null);
  readonly invoiceAmount = input<number>(0);
  readonly advances = input<Advance[]>([]);

  readonly selected = output<{ advanceId: string; amount: number }>();
  readonly cancelled = output<void>();

  readonly form: FormGroup = this.fb.group({
    advanceId: ['', [Validators.required]],
    amount: [0, [Validators.required, Validators.min(0.01)]],
  });

  readonly selectedAdvance = computed(() => {
    const id = this.form.value.advanceId;
    return this.advances().find((a) => a.id === id) ?? null;
  });

  readonly maxAmount = computed(() => {
    const advance = this.selectedAdvance();
    if (!advance) return 0;
    return Math.min(advance.remainingAmount, this.invoiceAmount());
  });

  readonly advanceOptions = computed(() => {
    return this.advances()
      .filter((a) => a.remainingAmount > 0)
      .map((a) => ({
        label: `#${a.paymentNumber} - ${a.remainingAmount.toFixed(2)}`,
        value: a.id,
      }));
  });

  onAdvanceChange(): void {
    this.form.patchValue({ amount: 0 });
  }

  onConfirm(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.selected.emit({
      advanceId: this.form.value.advanceId,
      amount: this.form.value.amount,
    });
  }

  onCancel(): void {
    this.form.reset();
    this.cancelled.emit();
  }

  getStatusLabel(status: string): string {
    return getPaymentStatusLabel(status as PaymentStatus);
  }

  getStatusVariant(status: string): 'success' | 'danger' | 'info' | 'label' {
    const variants: Record<PaymentStatus, 'success' | 'danger' | 'info' | 'label'> = {
      [PaymentStatus.DRAFT]: 'label',
      [PaymentStatus.APPLIED]: 'success',
      [PaymentStatus.PARTIALLY_APPLIED]: 'info',
      [PaymentStatus.CANCELLED]: 'danger',
    };
    return variants[status as PaymentStatus] ?? 'label';
  }
}
