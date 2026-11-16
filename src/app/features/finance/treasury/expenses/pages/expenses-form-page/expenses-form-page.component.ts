import { TranslatePipe } from '@core/i18n/translate.pipe';
import { LanguageService } from '@core/i18n/language.service';
import { TranslationService } from '@core/i18n/translation.service';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  effect,
  inject,
} from '@angular/core';
import { ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import {
  FormContainerComponent,
  FormHeaderComponent,
  FormActionsComponent,
} from '@core/forms/components';
import { BaseFormComponent, FormConfig } from '@core/forms/base/base-form.component';
import { ExpensesApplicationService } from '@features/finance/treasury/expenses/services/application/expenses-application.service';
import { PanelCardComponent } from '@shared/components/ui/panel-card/panel-card.component';

interface ExpenseFormData {
  amount: number | null;
  paymentMethodId: string | null;
  registerId: string | null;
  occurredAt: Date | null;
  description: string;
}

@Component({
  selector: 'app-expenses-form-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PanelCardComponent,
    TranslatePipe,
    ReactiveFormsModule,
    ButtonModule,
    DatePickerModule,
    InputNumberModule,
    SelectModule,
    TextareaModule,
    FormContainerComponent,
    FormHeaderComponent,
    FormActionsComponent,
  ],
  templateUrl: './expenses-form-page.component.html',
})
export class ExpensesFormPageComponent
  extends BaseFormComponent<ExpenseFormData>
  implements OnInit
{
  protected readonly service = inject(ExpensesApplicationService);
  private readonly translation = inject(TranslationService);
  private readonly messageService = inject(MessageService);
  private readonly expenseDestroyRef = inject(DestroyRef);
  readonly locale = inject(LanguageService).locale;

  readonly registerOptions = computed(() => {
    const formatter = new Intl.DateTimeFormat(this.locale(), {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    return this.service.registers().map((register) => ({
      id: register.id,
      label: `${formatter.format(new Date(register.openedAt))} · ${
        register.status === 'OPEN'
          ? this.translation.t('finance.treasury.expenses.openRegister')
          : this.translation.t('finance.treasury.expenses.closedRegister')
      }`,
    }));
  });

  private readonly defaultsEffect = effect(() => {
    if (!this.service.registers().length || !this.form) return;
    this.applyDefaults();
  });

  getConfig(): FormConfig {
    return {
      entityDisplayName: 'finance.treasury.expenses.expense',
      entityArticle: 'del',
      module: 'finances',
      routeBase: '/finance/treasury/expenses',
    };
  }

  createForm(): FormGroup {
    return this.fb.group({
      amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
      paymentMethodId: [null as string | null, Validators.required],
      registerId: [null as string | null, Validators.required],
      occurredAt: [null as Date | null, Validators.required],
      description: ['', [Validators.required, Validators.maxLength(500)]],
    });
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.service
      .loadContext()
      .pipe(takeUntilDestroyed(this.expenseDestroyRef))
      .subscribe(() => {
        if (!this.service.hasRegisters()) {
          this.router.navigate(['/finance/treasury/expenses']);
        }
      });
  }

  override onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor, complete todos los campos requeridos correctamente.',
        life: 5000,
      });
      return;
    }

    const value = this.form.getRawValue() as ExpenseFormData;
    const registerId = value.registerId;
    const occurredAt = value.occurredAt;
    if (!registerId || !occurredAt) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor, complete todos los campos requeridos correctamente.',
        life: 5000,
      });
      return;
    }

    this.service
      .createExpense({
        registerId,
        amount: value.amount ?? 0,
        paymentMethodId: value.paymentMethodId ?? '',
        description: value.description.trim(),
        occurredAt: this.toLocalDateTime(occurredAt),
      })
      .pipe(takeUntilDestroyed(this.expenseDestroyRef))
      .subscribe({
        next: () => {
          this.markAsSubmitted();
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Gasto creado exitosamente',
            life: 3000,
          });
          this.router.navigate(['/finance/treasury/expenses']);
        },
        error: (error: { error?: { message?: string } }) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail:
              error?.error?.message ?? 'Error al crear el gasto. Por favor, intente nuevamente.',
            life: 5000,
          });
        },
      });
  }

  private applyDefaults(): void {
    const patch: Partial<ExpenseFormData> = {};
    if (!this.form.get('registerId')?.value) {
      patch.registerId = this.service.defaultRegisterId() || null;
    }
    if (!this.form.get('occurredAt')?.value) {
      patch.occurredAt = new Date();
    }
    if (Object.keys(patch).length) {
      this.form.patchValue(patch, { emitEvent: false });
    }
  }

  private toLocalDateTime(date: Date): string {
    const pad = (value: number): string => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
      date.getHours(),
    )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }
}
