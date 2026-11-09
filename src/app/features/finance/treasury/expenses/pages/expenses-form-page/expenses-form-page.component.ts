import { TranslatePipe } from '@core/i18n/translate.pipe';
import { LanguageService } from '@core/i18n/language.service';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
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
  private readonly expenseDestroyRef = inject(DestroyRef);
  readonly locale = inject(LanguageService).locale;

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
      description: ['', [Validators.required, Validators.maxLength(500)]],
    });
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.service
      .loadContext()
      .pipe(takeUntilDestroyed(this.expenseDestroyRef))
      .subscribe(() => {
        if (!this.service.hasOpenRegister()) {
          this.router.navigate(['/finance/treasury/expenses']);
        }
      });
  }

  override onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || !this.service.hasOpenRegister()) return;

    const value = this.form.getRawValue() as ExpenseFormData;

    this.service
      .createExpense({
        amount: value.amount ?? 0,
        paymentMethodId: value.paymentMethodId ?? '',
        description: value.description.trim(),
      })
      .pipe(takeUntilDestroyed(this.expenseDestroyRef))
      .subscribe({
        next: (result) => {
          if (!result) return;
          this.markAsSubmitted();
          this.router.navigate(['/finance/treasury/expenses']);
        },
      });
  }
}
