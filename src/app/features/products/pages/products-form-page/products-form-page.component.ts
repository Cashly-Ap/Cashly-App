import { Component, inject, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { MainLayoutComponent } from '@core/layouts/main-layout.component';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { TabsModule } from 'primeng/tabs';
import { TableModule } from 'primeng/table';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageService } from 'primeng/api';
import { EmptyStateComponent } from '@shared/components/ui/empty-state/empty-state.component';
import {
  FormContainerComponent,
  FormHeaderComponent,
  FormCardComponent,
  FormActionsComponent,
  TabContentComponent,
  TextInputComponent,
  SelectInputComponent,
  NumberInputComponent,
} from '@core/forms/components';
import { ProductApplicationService } from '@features/products/services/application';
import { CategoryApplicationService } from '@features/categories/services/application';
import { BaseFormComponent, FormConfig } from '@core/forms/base/base-form.component';
import { ProductComponentInput } from '@features/products/models/interfaces';

interface ProductFormData {
  name: string;
  categoryId: string | null;
  description: string;
  composite: boolean;
  basePrice: number | null;
  purchasePrice: number | null;
  profitMargin: number | null;
  components: { componentId: string | null; quantity: number }[];
}

@Component({
  selector: 'app-products-form-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MainLayoutComponent,
    TextareaModule,
    SelectModule,
    InputNumberModule,
    ButtonModule,
    TabsModule,
    TableModule,
    FormContainerComponent,
    FormHeaderComponent,
    FormCardComponent,
    FormActionsComponent,
    TabContentComponent,
    TextInputComponent,
    SelectInputComponent,
    NumberInputComponent,
    EmptyStateComponent,
  ],
  templateUrl: './products-form-page.component.html',
  providers: [MessageService],
})
export class ProductsFormPageComponent extends BaseFormComponent<ProductFormData> implements OnInit {
  private service = inject(ProductApplicationService);
  private categoryService = inject(CategoryApplicationService);
  private messageService = inject(MessageService);

  loading = this.service.loading;

  productTypeOptions = [
    { value: false, label: 'Simple' },
    { value: true, label: 'Compuesto' },
  ];

  categoryOptions = computed(() =>
    this.categoryService.categories().map((c) => ({ value: c.id, label: c.name }))
  );

  simpleProductOptions = computed(() =>
    this.service.simpleProducts().map((p) => ({ value: p.id, label: p.name }))
  );

  isComposite = signal(false);

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
      composite: [false],
      basePrice: [null, [Validators.min(0)]],
      purchasePrice: [null, [Validators.min(0)]],
      profitMargin: [null, [Validators.min(0), Validators.max(100)]],
      components: this.fb.array([]),
    });
  }

  override ngOnInit(): void {
    super.ngOnInit?.();
    this.categoryService.loadAll({ size: 1000 }).subscribe();
    this.service.loadSimpleProducts().subscribe();

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
      componentId: [null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(0.01)]],
    });
    this.componentsArray.push(group);
  }

  removeComponent(index: number): void {
    this.componentsArray.removeAt(index);
  }

  protected override getPendingTabTitle(formData: ProductFormData): string {
    return formData.name?.trim() || super.getPendingTabTitle(formData);
  }

  protected override restoreFormData(data: ProductFormData): void {
    this.form.patchValue({
      name: data.name,
      categoryId: data.categoryId,
      description: data.description,
      composite: data.composite,
      basePrice: data.basePrice,
      purchasePrice: data.purchasePrice,
      profitMargin: data.profitMargin,
    });
    if (data.components?.length) {
      while (this.componentsArray.length) this.componentsArray.removeAt(0);
      data.components.forEach((c) => {
        this.componentsArray.push(this.fb.group({
          componentId: [c.componentId, Validators.required],
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
          composite: product.composite,
          basePrice: product.basePrice ?? null,
          purchasePrice: product.purchasePrice ?? null,
          profitMargin: product.profitMargin ?? null,
        });
        while (this.componentsArray.length) this.componentsArray.removeAt(0);
        product.components.forEach((c) => {
          this.componentsArray.push(this.fb.group({
            componentId: [c.componentId, Validators.required],
            quantity: [c.quantity, [Validators.required, Validators.min(0.01)]],
          }));
        });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el producto.', life: 5000 });
        this.router.navigate(['/products']);
      },
    });
  }

  override onSubmit(): void {
    if (this.form.valid) {
      const value = this.form.getRawValue() as ProductFormData;
      const components: ProductComponentInput[] = value.composite
        ? value.components.map((c) => ({ componentId: c.componentId!, quantity: c.quantity }))
        : [];

      if (this.isEditMode() && this.entityId()) {
        const payload = {
          name: value.name,
          categoryId: value.categoryId!,
          description: value.description || undefined,
          basePrice: value.basePrice ?? undefined,
          purchasePrice: value.purchasePrice ?? undefined,
          profitMargin: value.profitMargin ?? undefined,
          components,
        };
        this.service.update(this.entityId()!, payload).subscribe({
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
        const payload = {
          name: value.name,
          categoryId: value.categoryId!,
          description: value.description || undefined,
          composite: value.composite,
          basePrice: value.basePrice ?? undefined,
          purchasePrice: value.purchasePrice ?? undefined,
          profitMargin: value.profitMargin ?? undefined,
          components,
        };
        this.service.create(payload).subscribe({
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
    } else {
      this.form.markAllAsTouched();
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Por favor, complete todos los campos requeridos.', life: 5000 });
    }
  }
}
