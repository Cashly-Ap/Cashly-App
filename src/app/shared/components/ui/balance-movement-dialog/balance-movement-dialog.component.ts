import { TranslatePipe } from '@core/i18n/translate.pipe';
import { LocalizedCurrencyPipe } from '@core/i18n/localized-format.pipe';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { PaymentMethodApiService } from '@features/finance/treasury/payment-methods/services/api/payment-method-api.service';
import { PermissionDirective } from '@features/platform/auth/authorization/directives/permission.directive';
import { LanguageService } from '@core/i18n/language.service';
import { CancelButtonComponent } from '@shared/components/ui/cancel-button/cancel-button.component';

export interface BalanceMovementSubmit {
  amount: number;
  paymentMethodId: string;
  notes?: string;
}

@Component({
  selector: 'app-balance-movement-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslatePipe,
    LocalizedCurrencyPipe,
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    InputNumberModule,
    InputTextModule,
    SelectModule,
    TextareaModule,
    CancelButtonComponent,
    PermissionDirective,
  ],
  templateUrl: './balance-movement-dialog.component.html',
})
export class BalanceMovementDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly messages = inject(MessageService);
  private readonly paymentMethodApi = inject(PaymentMethodApiService);
  readonly locale = inject(LanguageService).locale;

  readonly visible = model(false);
  readonly titleKey = input.required<string>();
  readonly balanceLabelKey = input.required<string>();
  readonly amountLabelKey = input.required<string>();
  readonly submitLabelKey = input.required<string>();
  readonly submitIcon = input('pi pi-check');
  readonly notesPlaceholderKey = input('finance.billing.invoices.notes');
  readonly permissionModule = input<string>('');
  readonly balance = input(0);
  readonly maxAmount = input<number | null>(null);
  readonly loading = input(false);

  readonly submitted = output<BalanceMovementSubmit>();
  readonly cancelled = output<void>();

  readonly paymentMethods = signal<{ label: string; value: string }[]>([]);

  readonly form: FormGroup = this.fb.group({
    amount: [null, [Validators.required, Validators.min(0.01)]],
    paymentMethodId: [null, Validators.required],
    notes: [''],
  });

  constructor() {
    this.loadPaymentMethods();
    effect(() => {
      if (!this.visible()) return;
      untracked(() => this.configureForm());
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messages.add({
        severity: 'warn',
        summary: 'shared.warning',
        detail: 'shared.completeAmountAndPaymentMethod',
        life: 4000,
      });
      return;
    }

    const value = this.form.getRawValue();
    this.submitted.emit({
      amount: value.amount,
      paymentMethodId: value.paymentMethodId,
      ...(value.notes ? { notes: value.notes } : {}),
    });
  }

  cancel(): void {
    this.visible.set(false);
    this.form.reset();
    this.cancelled.emit();
  }

  onVisibleChange(visible: boolean): void {
    if (!visible) {
      this.form.reset();
      this.cancelled.emit();
    }
  }

  private configureForm(): void {
    const max = this.maxAmount();
    const validators = [Validators.required, Validators.min(0.01)];
    if (max !== null && max > 0) validators.push(Validators.max(max));
    this.form.controls['amount'].setValidators(validators);
    this.form.controls['amount'].updateValueAndValidity();
    this.form.reset({
      amount: max !== null && max > 0 ? max : null,
      paymentMethodId: this.paymentMethods()[0]?.value ?? null,
      notes: '',
    });
  }

  private loadPaymentMethods(): void {
    this.paymentMethodApi.getAll({ active: true, size: 100 }).subscribe({
      next: (response) => {
        this.paymentMethods.set(
          (response.content ?? []).map((method) => ({ label: method.name, value: method.id })),
        );
      },
      error: () => this.paymentMethods.set([]),
    });
  }
}
