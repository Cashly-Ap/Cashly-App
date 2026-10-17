import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { MessageService } from 'primeng/api';
import {
  FormContainerComponent,
  FormHeaderComponent,
  FormCardComponent,
  FormActionsComponent,
} from '@core/forms/components';
import { PriceTypeApplicationService } from '@features/catalog/price-types/services/application/price-type-application.service';
import { BaseFormComponent, FormConfig } from '@core/forms/base/base-form.component';

interface PriceTypeFormData {
  name: string;
  active: boolean;
}

@Component({
  selector: 'app-price-types-form-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ToggleSwitchModule,
    FormContainerComponent,
    FormHeaderComponent,
    FormCardComponent,
    FormActionsComponent,
  ],
  templateUrl: './price-types-form-page.component.html',
})
export class PriceTypesFormPageComponent extends BaseFormComponent<PriceTypeFormData> {
  private service = inject(PriceTypeApplicationService);
  private messageService = inject(MessageService);

  loading = this.service.isLoading;

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
      entityDisplayName: 'Tipo de Precio',
      entityArticle: 'del',
      module: 'price-types',
      routeBase: '/catalog/price-types',
    };
  }

  createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      active: [true],
    });
  }

  protected override getPendingTabTitle(formData: PriceTypeFormData): string {
    return formData.name?.trim() || super.getPendingTabTitle(formData);
  }

  protected override restoreFormData(data: PriceTypeFormData): void {
    this.form.patchValue({ name: data.name, active: data.active });
  }

  protected override onLoadEntity(id: string): void {
    this.service.loadById(id).subscribe({
      next: (priceType) => {
        this.form.patchValue({ name: priceType.name, active: priceType.active });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar el tipo de precio.',
          life: 5000,
        });
        this.router.navigate(['/catalog/price-types']);
      },
    });
  }

  override onSubmit(): void {
    if (this.form.valid) {
      const value = this.form.getRawValue() as PriceTypeFormData;

      if (this.isEditMode() && this.entityId()) {
        this.service
          .update(this.entityId()!, { name: value.name, active: value.active })
          .subscribe({
            next: () => {
              this.markAsSubmitted();
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Tipo de precio actualizado exitosamente',
                life: 3000,
              });
              this.router.navigate(['/catalog/price-types']);
            },
            error: () => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al actualizar el tipo de precio.',
                life: 5000,
              });
            },
          });
      } else {
        this.service.create({ name: value.name }).subscribe({
          next: () => {
            this.markAsSubmitted();
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Tipo de precio creado exitosamente',
              life: 3000,
            });
            this.router.navigate(['/catalog/price-types']);
          },
          error: (err: { error?: { message?: string } }) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err?.error?.message || 'Error al crear el tipo de precio.',
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
