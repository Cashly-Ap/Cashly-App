import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { MainLayoutComponent } from '@core/layouts/main-layout.component';
import { ButtonModule } from 'primeng/button';
import { TabsModule } from 'primeng/tabs';
import { MessageService } from 'primeng/api';
import {
  FormContainerComponent,
  FormHeaderComponent,
  FormCardComponent,
  FormActionsComponent,
} from '@core/forms/components';
import { ProductApplicationService } from '@features/products/services/application';
import { ProductPhotoService } from '@features/products/services/api';
import { BaseFormComponent, FormConfig } from '@core/forms/base/base-form.component';
import { ProductComponentInput } from '@features/products/models/interfaces';
import { ProductGeneralSectionComponent } from '@features/products/components/product-general-section/product-general-section.component';
import { ProductCompositionSectionComponent } from '@features/products/components/product-composition-section/product-composition-section.component';
import { switchMap, of } from 'rxjs';

interface ProductFormData {
  name: string;
  categoryId: string | null;
  description: string;
  active: boolean;
  composite: boolean;
  basePrice: number | null;
  purchasePrice: number | null;
  profitMargin: number | null;
  photo: File | null;
  components: { componentProductId: string | null; quantity: number }[];
}

@Component({
  selector: 'app-products-form-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MainLayoutComponent,
    ButtonModule,
    TabsModule,
    FormContainerComponent,
    FormHeaderComponent,
    FormCardComponent,
    FormActionsComponent,
    ProductGeneralSectionComponent,
    ProductCompositionSectionComponent,
  ],
  templateUrl: './products-form-page.component.html',
})
export class ProductsFormPageComponent extends BaseFormComponent<ProductFormData> implements OnInit {
  private readonly service = inject(ProductApplicationService);
  private readonly photoService = inject(ProductPhotoService);
  private readonly messageService = inject(MessageService);

  readonly loading = this.service.loading;
  readonly existingPhotoUrl = this.photoService.photoUrl;

  readonly isComposite = signal(false);

  get componentsArray(): FormArray {
    return this.form.get('components') as FormArray;
  }

  asFormControl(name: string): FormControl {
    return this.form.get(name) as FormControl;
  }

  getConfig(): FormConfig {
    return {
      entityDisplayName: 'Producto',
      entityArticle: 'del',
      module: 'products',
      routeBase: '/products',
    };
  }

  createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(150)]],
      categoryId: [null, [Validators.required]],
      description: ['', [Validators.maxLength(500)]],
      active: [true],
      composite: [false],
      basePrice: [null, [Validators.min(0)]],
      purchasePrice: [null, [Validators.min(0)]],
      profitMargin: [null, [Validators.min(0), Validators.max(100)]],
      photo: [null],
      components: this.fb.array([]),
    });
  }

  override ngOnInit(): void {
    super.ngOnInit?.();

    this.form.get('composite')?.valueChanges.subscribe((val: boolean) => {
      this.isComposite.set(val);
      if (!val) {
        while (this.componentsArray.length) this.componentsArray.removeAt(0);
      } else if (this.componentsArray.length === 0) {
        this.addComponent();
      }
    });
  }

  addComponent(): void {
    const group = this.fb.group({
      componentProductId: [null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(0.01)]],
    });
    this.componentsArray.push(group);
  }

  removeComponent(index: number): void {
    this.componentsArray.removeAt(index);
  }

  onDeletePhoto(): void {
    const id = this.entityId();
    if (!id) return;
    this.photoService.deletePhoto(id).subscribe({
      next: () => {
        this.photoService.clearPhoto();
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Foto eliminada exitosamente', life: 3000 });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al eliminar la foto.', life: 5000 });
      },
    });
  }

  protected override getPendingTabTitle(formData: ProductFormData): string {
    return formData.name?.trim() || super.getPendingTabTitle(formData);
  }

  protected override restoreFormData(data: ProductFormData): void {
    this.form.patchValue({
      name: data.name,
      categoryId: data.categoryId,
      description: data.description,
      active: data.active,
      composite: data.composite,
      basePrice: data.basePrice,
      purchasePrice: data.purchasePrice,
      profitMargin: data.profitMargin,
    });
    if (data.components?.length) {
      while (this.componentsArray.length) this.componentsArray.removeAt(0);
      data.components.forEach((c) => {
        this.componentsArray.push(this.fb.group({
          componentProductId: [c.componentProductId, Validators.required],
          quantity: [c.quantity, [Validators.required, Validators.min(0.01)]],
        }));
      });
    }
    this.isComposite.set(!!data.composite);
  }

  protected override onLoadEntity(id: string): void {
    this.service.loadById(id).subscribe({
      next: (product) => {
        this.isComposite.set(product.composite);
        this.form.patchValue({
          name: product.name,
          categoryId: product.categoryId,
          description: product.description ?? '',
          active: product.active,
          composite: product.composite,
          basePrice: product.basePrice ?? null,
          purchasePrice: product.purchasePrice ?? null,
          profitMargin: product.profitMargin ?? null,
        });
        while (this.componentsArray.length) this.componentsArray.removeAt(0);
        product.components.forEach((c) => {
          this.componentsArray.push(this.fb.group({
            componentProductId: [c.componentProductId, Validators.required],
            quantity: [c.quantity, [Validators.required, Validators.min(0.01)]],
          }));
        });
        this.photoService.loadPhoto(product.photo);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el producto.', life: 5000 });
        this.router.navigate(['/products']);
      },
    });
  }

  override onSubmit(): void {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Por favor, complete todos los campos requeridos.', life: 5000 });
      return;
    }

    const value = this.form.getRawValue() as ProductFormData;
    const components: ProductComponentInput[] = value.composite
      ? value.components.map((c) => ({ componentProductId: c.componentProductId!, quantity: c.quantity }))
      : [];

    const payload = {
      name: value.name,
      categoryId: value.categoryId!,
      description: value.description || undefined,
      active: value.active,
      composite: value.composite,
      basePrice: value.basePrice ?? undefined,
      purchasePrice: value.purchasePrice ?? undefined,
      profitMargin: value.profitMargin ?? undefined,
      components,
    };

    if (this.isEditMode() && this.entityId()) {
      this.service.update(this.entityId()!, payload).pipe(
        switchMap((product) => {
          if (value.photo) {
            return this.photoService.uploadPhoto(product?.id ?? this.entityId()!, value.photo);
          }
          return of(undefined);
        }),
      ).subscribe({
        next: () => {
          this.markAsSubmitted();
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Producto actualizado exitosamente', life: 3000 });
          this.router.navigate(['/products']);
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar el producto.', life: 5000 });
        },
      });
    } else {
      this.service.create(payload).pipe(
        switchMap((product) => {
          if (value.photo && product?.id) {
            return this.photoService.uploadPhoto(product.id, value.photo);
          }
          return of(undefined);
        }),
      ).subscribe({
        next: () => {
          this.markAsSubmitted();
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Producto creado exitosamente', life: 3000 });
          this.router.navigate(['/products']);
        },
        error: (err: { error?: { message?: string } }) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message || 'Error al crear el producto.', life: 5000 });
        },
      });
    }
  }
}
