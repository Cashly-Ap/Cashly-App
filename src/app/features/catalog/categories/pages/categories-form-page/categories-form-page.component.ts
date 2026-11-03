import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { MessageService } from 'primeng/api';
import {
  FormContainerComponent,
  FormHeaderComponent,
  FormActionsComponent,
} from '@core/forms/components';
import { CategoryApplicationService } from '@features/catalog/categories/services/application/category-application.service';
import { BaseFormComponent, FormConfig } from '@core/forms/base/base-form.component';

interface CategoryFormData {
  name: string;
  description: string;
  active: boolean;
}

import { PanelCardComponent } from '@shared/components/ui/panel-card/panel-card.component';
@Component({
  selector: 'app-categories-form-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PanelCardComponent,
    TranslatePipe,
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
    ToggleSwitchModule,
    FormContainerComponent,
    FormHeaderComponent,
    FormActionsComponent,
  ],
  templateUrl: './categories-form-page.component.html',
})
export class CategoriesFormPageComponent extends BaseFormComponent<CategoryFormData> {
  private service = inject(CategoryApplicationService);
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
      entityDisplayName: 'Categoría',
      entityArticle: 'de la',
      module: 'categories',
      routeBase: '/catalog/categories',
    };
  }

  createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      active: [true],
    });
  }

  protected override getPendingTabTitle(formData: CategoryFormData): string {
    return formData.name?.trim() || super.getPendingTabTitle(formData);
  }

  protected override restoreFormData(data: CategoryFormData): void {
    this.form.patchValue({ name: data.name, description: data.description, active: data.active });
  }

  protected override onLoadEntity(id: string): void {
    this.service.loadById(id).subscribe({
      next: (category) => {
        this.form.patchValue({
          name: category.name,
          description: category.description ?? '',
          active: category.active,
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar la categoría.',
          life: 5000,
        });
        this.router.navigate(['/catalog/categories']);
      },
    });
  }

  override onSubmit(): void {
    if (this.form.valid) {
      const value = this.form.getRawValue() as CategoryFormData;
      const payload = {
        name: value.name,
        description: value.description || undefined,
        active: value.active,
      };

      if (this.isEditMode() && this.entityId()) {
        this.service.update(this.entityId()!, payload).subscribe({
          next: () => {
            this.markAsSubmitted();
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Categoría actualizada exitosamente',
              life: 3000,
            });
            this.router.navigate(['/catalog/categories', this.entityId()!]);
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al actualizar la categoría.',
              life: 5000,
            });
          },
        });
      } else {
        this.service.create(payload).subscribe({
          next: (created) => {
            this.markAsSubmitted();
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Categoría creada exitosamente',
              life: 3000,
            });
            this.router.navigate(['/catalog/categories', created.id]);
          },
          error: (err: { error?: { message?: string } }) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err?.error?.message || 'Error al crear la categoría.',
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
