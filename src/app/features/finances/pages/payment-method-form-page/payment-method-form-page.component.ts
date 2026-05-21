import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { MainLayoutComponent } from '@core/layouts/main-layout.component';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { MessageService } from 'primeng/api';
import {
  FormContainerComponent,
  FormHeaderComponent,
  FormCardComponent,
  FormActionsComponent,
} from '@core/forms/components';
import { FinanceApplicationService } from '@features/finances/services/application';
import { BaseFormComponent, FormConfig } from '@core/forms/base/base-form.component';

interface PaymentMethodFormData {
  name: string;
  description: string;
  isActive: boolean;
}

@Component({
  selector: 'app-payment-method-form-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MainLayoutComponent,
    InputTextModule,
    TextareaModule,
    ToggleSwitchModule,
    FormContainerComponent,
    FormHeaderComponent,
    FormCardComponent,
    FormActionsComponent,
  ],
  templateUrl: './payment-method-form-page.component.html',
})
export class PaymentMethodFormPageComponent extends BaseFormComponent<PaymentMethodFormData> {
  private service = inject(FinanceApplicationService);
  private messageService = inject(MessageService);

  loading = this.service.loading;

  submitTooltip = signal('');

  private readonly FIELD_LABELS: Record<string, string> = {
    name: 'Nombre',
  };

  override ngOnInit(): void {
    super.ngOnInit?.();
    this.form.statusChanges.subscribe(() => this.updateSubmitTooltip());
    this.updateSubmitTooltip();
  }

  private updateSubmitTooltip(): void {
    const invalid = Object.entries(this.FIELD_LABELS)
      .filter(([key]) => this.form.get(key)?.invalid)
      .map(([, label]) => label);
    this.submitTooltip.set(invalid.length ? `Campos requeridos: ${invalid.join(', ')}` : '');
  }

  getConfig(): FormConfig {
    return {
      entityDisplayName: 'Método de Pago',
      entityArticle: 'del',
      module: 'finances',
      routeBase: '/finances',
    };
  }

  createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      isActive: [true],
    });
  }

  protected override getPendingTabTitle(formData: PaymentMethodFormData): string {
    return formData.name?.trim() || super.getPendingTabTitle(formData);
  }

  protected override restoreFormData(data: PaymentMethodFormData): void {
    this.form.patchValue({ name: data.name, description: data.description, isActive: data.isActive });
  }

  protected override onLoadEntity(id: string): void {
    this.service.loadPaymentMethodById(id).subscribe({
      next: (paymentMethod) => {
        this.form.patchValue({
          name: paymentMethod.name,
          description: paymentMethod.description ?? '',
          isActive: paymentMethod.isActive,
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar el método de pago.',
          life: 5000,
        });
        this.router.navigate(['/finances']);
      },
    });
  }

  override onSubmit(): void {
    if (this.form.valid) {
      const value = this.form.getRawValue() as PaymentMethodFormData;
      const payload = { name: value.name, description: value.description || undefined };

      if (this.isEditMode() && this.entityId()) {
        this.service.updatePaymentMethod(this.entityId()!, payload).subscribe({
          next: () => {
            this.markAsSubmitted();
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Método de pago actualizado exitosamente',
              life: 3000,
            });
            this.router.navigate(['/finances']);
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al actualizar el método de pago.',
              life: 5000,
            });
          },
        });
      } else {
        this.service.createPaymentMethod(payload).subscribe({
          next: () => {
            this.markAsSubmitted();
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Método de pago creado exitosamente',
              life: 3000,
            });
            this.router.navigate(['/finances']);
          },
          error: (err: { error?: { message?: string } }) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err?.error?.message || 'Error al crear el método de pago.',
              life: 5000,
            });
          },
        });
      }
    } else {
      this.form.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor, complete todos los campos requeridos.',
        life: 5000,
      });
    }
  }
}
