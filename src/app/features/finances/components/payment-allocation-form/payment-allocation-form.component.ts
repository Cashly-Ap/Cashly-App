import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormArray, Validators } from '@angular/forms';
import { inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextBadgeComponent } from '@shared/components/ui/text-badge/text-badge.component';

interface InvoiceAllocation {
  invoiceId: string;
  invoiceNumber: string;
  totalAmount: number;
  remainingAmount: number;
  allocatedAmount: number;
}

@Component({
  selector: 'app-payment-allocation-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    TableModule,
    InputNumberModule,
    TextBadgeComponent,
  ],
  templateUrl: './payment-allocation-form.component.html',
})
export class PaymentAllocationFormComponent {
  private readonly fb = inject(FormBuilder);

  readonly visible = input<boolean>(false);
  readonly paymentId = input<string | null>(null);
  readonly paymentAmount = input<number>(0);
  readonly invoices = input<InvoiceAllocation[]>([]);

  readonly applied = output<{ paymentId: string; allocations: { invoiceId: string; amount: number }[] }>();
  readonly cancelled = output<void>();

  readonly form: FormGroup = this.fb.group({
    allocations: this.fb.array([]),
  });

  readonly allocationsArray = this.form.get('allocations') as FormArray;

  readonly totalAllocated = computed(() => {
    return this.allocationsArray.controls.reduce((sum, ctrl) => {
      return sum + (ctrl.get('allocatedAmount')?.value ?? 0);
    }, 0);
  });

  readonly remainingToAllocate = computed(() => {
    return this.paymentAmount() - this.totalAllocated();
  });

  readonly isOverAllocated = computed(() => {
    return this.totalAllocated() > this.paymentAmount();
  });

  readonly isValid = computed(() => {
    return this.totalAllocated() > 0 && !this.isOverAllocated();
  });

  ngOnChanges(): void {
    if (this.visible()) {
      this.initAllocations();
    } else {
      this.form.reset();
      this.allocationsArray.clear();
    }
  }

  private initAllocations(): void {
    this.allocationsArray.clear();
    for (const invoice of this.invoices()) {
      this.allocationsArray.push(
        this.fb.group({
          invoiceId: [invoice.invoiceId],
          invoiceNumber: [invoice.invoiceNumber],
          remainingAmount: [invoice.remainingAmount],
          allocatedAmount: [0, [Validators.min(0), Validators.max(invoice.remainingAmount)]],
        }),
      );
    }
  }

  onAllocationAmountChange(index: number, value: number | null): void {
    const ctrl = this.allocationsArray.at(index);
    const maxAmount = ctrl.get('remainingAmount')?.value ?? 0;
    if (value !== null && value > maxAmount) {
      ctrl.get('allocatedAmount')?.setValue(maxAmount);
    }
  }

  onApply(): void {
    if (!this.isValid() || !this.paymentId()) return;

    const allocations = this.allocationsArray.controls
      .filter((ctrl) => (ctrl.get('allocatedAmount')?.value ?? 0) > 0)
      .map((ctrl) => ({
        invoiceId: ctrl.get('invoiceId')?.value,
        amount: ctrl.get('allocatedAmount')?.value ?? 0,
      }));

    this.applied.emit({ paymentId: this.paymentId()!, allocations });
  }

  onCancel(): void {
    this.form.reset();
    this.allocationsArray.clear();
    this.cancelled.emit();
  }
}
