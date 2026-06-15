import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { MainLayoutComponent } from '@core/layouts/main-layout.component';
import { FormContainerComponent, FormCardComponent } from '@core/forms/components/cards';
import { FormHeaderComponent, FormActionsComponent } from '@core/forms/components/headers';
import { NumberInputComponent } from '@core/forms/components/inputs';
import { AuthService } from '@features/auth/services/application';
import { AUTH_SUCCESS_MESSAGES, AUTH_ERROR_MESSAGES } from '@features/auth/messages';
import { createCommissionDeductionForm } from '@features/auth/pages/change-commission-deduction/change-commission-deduction-page';

@Component({
  selector: 'app-change-commission-deduction-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MainLayoutComponent,
    FormContainerComponent,
    FormCardComponent,
    FormHeaderComponent,
    FormActionsComponent,
    NumberInputComponent,
  ],
  templateUrl: './change-commission-deduction-page.component.html',
})
export class ChangeCommissionDeductionPageComponent implements OnInit {
  private router = inject(Router);
  protected authService = inject(AuthService);
  private messageService = inject(MessageService);

  form: FormGroup = createCommissionDeductionForm();

  protected control(field: string): AbstractControl | null {
    return this.form.get(field);
  }

  protected asFormControl(control: AbstractControl | null): FormControl {
    return control as FormControl;
  }

  ngOnInit(): void {
    const currentUser = this.authService.currentUser();
    if (currentUser) {
      this.form.patchValue({
        commissionDeductionPercentage: 0,
      });
    }
  }

  onSubmit(): void {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    const commissionDeductionPercentage = this.form.value.commissionDeductionPercentage!;

    this.authService.changeCommissionDeduction({ commissionDeductionPercentage }).subscribe({
      next: () => {
        this.messageService.add(AUTH_SUCCESS_MESSAGES.commissionDeductionChanged);
        this.router.navigate(['/auth/configuration']);
      },
      error: () => this.messageService.add(AUTH_ERROR_MESSAGES.changeCommissionDeduction),
    });
  }

  onCancel(): void {
    this.router.navigate(['/auth/configuration']);
  }

  getCommissionDeductionError(): string {
    const control = this.form.controls['commissionDeductionPercentage'];
    if (control.hasError('required')) {
      return 'El deducible mensual es requerido';
    }
    if (control.hasError('min')) {
      return 'El valor debe ser mayor o igual a 0';
    }
    if (control.hasError('max')) {
      return 'El valor no puede superar el 100%';
    }
    return '';
  }
}

