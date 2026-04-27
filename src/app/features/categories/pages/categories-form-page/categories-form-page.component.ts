import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { MainLayoutComponent } from '@core/layouts/main-layout.component';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { MessageService } from 'primeng/api';
import {
  FormContainerComponent,
  FormHeaderComponent,
  FormCardComponent,
  FormActionsComponent,
} from '@core/forms/components';
import { CategoryApplicationService } from '@features/categories/services/application';
import { BaseFormComponent, FormConfig } from '@core/forms/base/base-form.component';

interface CategoryFormData {
  name: string;
  description: string;
}

@Component({
  selector: 'app-categories-form-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MainLayoutComponent,
    InputTextModule,
    TextareaModule,
    FormContainerComponent,
    FormHeaderComponent,
    FormCardComponent,
    FormActionsComponent,
  ],
  templateUrl: './categories-form-page.component.html',
  providers: [MessageService],
})
export class CategoriesFormPageComponent extends BaseFormComponent<CategoryFormData> {
  private service = inject(CategoryApplicationService);
  private messageService = inject(MessageService);

  loading = this.service.loading;

  getConfig(): FormConfig {
    return {
      entityDisplayName: 'Categoría',
      entityArticle: 'de la',
      module: 'categories',
      routeBase: '/categories',
    };
  }

  createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
    });
  }

  protected override getPendingTabTitle(formData: CategoryFormData): string {
    return formData.name?.trim() || super.getPendingTabTitle(formData);
  }

  protected override restoreFormData(data: CategoryFormData): void {
    this.form.patchValue({ name: data.name, description: data.description });
  }

  protected override onLoadEntity(id: string): void {
    this.service.loadById(id).subscribe({
      next: (category) => {
        this.form.patchValue({ name: category.name, description: category.description ?? '' });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar la categoría.', life: 5000 });
        this.router.navigate(['/categories']);
      },
    });
  }

  override onSubmit(): void {
    if (this.form.valid) {
      const value = this.form.getRawValue() as CategoryFormData;
      const payload = { name: value.name, description: value.description || undefined };

      if (this.isEditMode() && this.entityId()) {
        this.service.update(this.entityId()!, payload).subscribe({
          next: () => {
            this.markAsSubmitted();
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Categoría actualizada exitosamente', life: 3000 });
            this.router.navigate(['/categories']);
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar la categoría.', life: 5000 });
          },
        });
      } else {
        this.service.create(payload).subscribe({
          next: () => {
            this.markAsSubmitted();
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Categoría creada exitosamente', life: 3000 });
            this.router.navigate(['/categories']);
          },
          error: (err: { error?: { message?: string } }) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message || 'Error al crear la categoría.', life: 5000 });
          },
        });
      }
    } else {
      this.form.markAllAsTouched();
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Por favor, complete todos los campos requeridos.', life: 5000 });
    }
  }
}
