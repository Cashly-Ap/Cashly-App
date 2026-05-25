import { Component, input, output, OnInit, inject, signal, effect, computed } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { PendingPayment } from '../../models/interfaces';

export type ApproveRejectAction = 'approve' | 'reject';

export interface ApprovePaymentPayload {
  paymentId: string;
  commissionPercentage?: number;
}

@Component({
  selector: 'app-approve-reject-dialog',
  standalone: true,
  imports: [
    DialogModule,
    ButtonModule,
    TextareaModule,
    InputNumberModule,
    ReactiveFormsModule,
    CurrencyPipe,
    DatePipe,
  ],
  templateUrl: './approve-reject-dialog.component.html',
})
export class ApproveRejectDialogComponent implements OnInit {
  private fb = inject(FormBuilder);

  readonly visible = input.required<boolean>();
  readonly action = input.required<ApproveRejectAction>();
  readonly payment = input.required<PendingPayment | null>();

  readonly close = output<void>();
  readonly approve = output<ApprovePaymentPayload>();
  readonly reject = output<{ paymentId: string; reason: string }>();

  protected form!: FormGroup;
  protected loading = signal(false);

  protected title = computed(() => {
    return this.action() === 'approve' ? 'Aprobar Pago' : 'Rechazar Pago';
  });

  constructor() {
    effect(() => {
      const isVisible = this.visible();
      if (isVisible && this.form) {
        this.form.reset();
        this.loading.set(false);
      }
    });
  }

  ngOnInit(): void {
    this.initForm();
  }

  protected onSubmit(): void {
    const payment = this.payment();
    if (!payment) return;

    if (this.action() === 'approve') {
      this.loading.set(true);
      const payload: ApprovePaymentPayload = {
        paymentId: payment.id,
      };
      this.approve.emit(payload);
      this.loading.set(false);
    } else {
      if (this.form.valid) {
        const reason = this.form.get('reason')?.value;
        this.reject.emit({ paymentId: payment.id, reason });
      }
    }
  }

  protected onCancel(): void {
    this.form?.reset();
    this.close.emit();
  }

  protected onVisibleChange(isVisible: boolean): void {
    if (!isVisible) {
      this.onCancel();
    }
  }

  private initForm(): void {
    this.form = this.fb.group({
      reason: ['', [Validators.required, Validators.maxLength(500)]],
    });
  }
}
