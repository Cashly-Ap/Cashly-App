import {
  Component,
  inject,
  OnInit,
  signal,
  ChangeDetectionStrategy,
  Injector,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TabsModule } from 'primeng/tabs';
import { MessageService } from 'primeng/api';
import {
  FormContainerComponent,
  FormHeaderComponent,
  FormCardComponent,
  FormActionsComponent,
} from '@core/forms/components';
import { ProductApplicationService } from '@features/catalog/products/services/application/product-application.service';
import { ProductPhotoService } from '@features/catalog/products/services/api/product-photo.service';
import { BaseFormComponent, FormConfig } from '@core/forms/base/base-form.component';
import { ProductComponentInput } from '@features/catalog/products/models/interfaces/product-create-update.interface';
import { ProductPriceItem } from '@features/catalog/products/models/interfaces/product-price-item.interface';
import { ProductGeneralSectionComponent } from '@features/catalog/products/components/product-general-section/product-general-section.component';
import { ProductCompositionSectionComponent } from '@features/catalog/products/components/product-composition-section/product-composition-section.component';
import { PriceTypeApplicationService } from '@features/catalog/price-types/services/application/price-type-application.service';
import { PriceTypeList } from '@features/catalog/price-types/models/interfaces/price-type-list.interface';
import { switchMap, of, combineLatest, filter, take } from 'rxjs';

interface ProductFormData {
  code: string;
  name: string;
  categoryId: string | null;
  description: string;
  active: boolean;
  composite: boolean;
  purchasePrice: number | null;
  photo: File | null;
  components: { componentProductId: string | null; quantity: number }[];
  productPrices: { priceTypeId: string; price: number; profitMargin: number | null }[];
}

@Component({
  selector: 'app-products-form-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
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
export class ProductsFormPageComponent
  extends BaseFormComponent<ProductFormData>
  implements OnInit
{
  private readonly service = inject(ProductApplicationService);
  private readonly photoService = inject(ProductPhotoService);
  private readonly messageService = inject(MessageService);
  private readonly priceTypeService = inject(PriceTypeApplicationService);
  private readonly injector = inject(Injector);

  readonly loading = this.service.loading;
  readonly existingPhotoUrl = this.photoService.photoUrl;

  readonly isComposite = signal(false);

  submitTooltip = signal('');

  private readonly FIELD_LABELS: Record<string, string> = {
    name: 'Nombre',
    categoryId: 'Categoría',
  };

  private updateSubmitTooltip(): void {
    const invalid = Object.entries(this.FIELD_LABELS)
      .filter(([key]) => this.form.get(key)?.invalid)
      .map(([, label]) => label);
    this.submitTooltip.set(invalid.length ? `Campos requeridos: ${invalid.join(', ')}` : '');
  }

  get componentsArray(): FormArray {
    return this.form.get('components') as FormArray;
  }

  get pricesArray(): FormArray {
    return this.form.get('productPrices') as FormArray;
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
      code: ['', [Validators.maxLength(50)]],
      name: ['', [Validators.required, Validators.maxLength(150)]],
      categoryId: [null, [Validators.required]],
      description: ['', [Validators.maxLength(500)]],
      active: [true],
      composite: [false],
      purchasePrice: [null, [Validators.min(0)]],
      photo: [null],
      components: this.fb.array([]),
      productPrices: this.fb.array([]),
    });
  }

  private buildPricesFormArray(
    priceTypes: PriceTypeList[],
    existingPrices: ProductPriceItem[] = [],
  ): void {
    while (this.pricesArray.length) this.pricesArray.removeAt(0);
    priceTypes.forEach((pt) => {
      const existing = existingPrices.find((p) => p.priceTypeId === pt.id);
      this.pricesArray.push(
        this.fb.group({
          priceTypeId: [pt.id],
          price: [existing?.price ?? 0, [Validators.required, Validators.min(0)]],
          profitMargin: [existing?.profitMargin ?? null, [Validators.min(0), Validators.max(100)]],
        }),
      );
    });
  }

  override ngOnInit(): void {
    super.ngOnInit?.();

    this.priceTypeService.loadAll({ size: 1000 }).subscribe();
    this.form.statusChanges.subscribe(() => this.updateSubmitTooltip());
    this.updateSubmitTooltip();

    if (!this.isEditMode()) {
      toObservable(this.priceTypeService.priceTypes, { injector: this.injector })
        .pipe(
          filter((t) => t.length > 0),
          take(1),
        )
        .subscribe((types) => {
          this.buildPricesFormArray(types, []);
        });
    }

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
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Foto eliminada exitosamente',
          life: 3000,
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al eliminar la foto.',
          life: 5000,
        });
      },
    });
  }

  protected override getPendingTabTitle(formData: ProductFormData): string {
    return formData.name?.trim() || super.getPendingTabTitle(formData);
  }

  protected override restoreFormData(data: ProductFormData): void {
    this.form.patchValue({
      code: data.code,
      name: data.name,
      categoryId: data.categoryId,
      description: data.description,
      active: data.active,
      composite: data.composite,
      purchasePrice: data.purchasePrice,
    });
    if (data.components?.length) {
      while (this.componentsArray.length) this.componentsArray.removeAt(0);
      data.components.forEach((c) => {
        this.componentsArray.push(
          this.fb.group({
            componentProductId: [c.componentProductId, Validators.required],
            quantity: [c.quantity, [Validators.required, Validators.min(0.01)]],
          }),
        );
      });
    }
    if (data.productPrices?.length) {
      while (this.pricesArray.length) this.pricesArray.removeAt(0);
      data.productPrices.forEach((p) => {
        this.pricesArray.push(
          this.fb.group({
            priceTypeId: [p.priceTypeId],
            price: [p.price, [Validators.required, Validators.min(0)]],
          }),
        );
      });
    }
    this.isComposite.set(!!data.composite);
  }

  protected override onLoadEntity(id: string): void {
    combineLatest([
      this.service.loadById(id),
      toObservable(this.priceTypeService.priceTypes, { injector: this.injector }).pipe(
        filter((t) => t.length > 0),
        take(1),
      ),
    ]).subscribe({
      next: ([product, types]) => {
        this.isComposite.set(product.composite);
        this.form.patchValue({
          code: product.code,
          name: product.name,
          categoryId: product.categoryId,
          description: product.description ?? '',
          active: product.active,
          composite: product.composite,
          purchasePrice: product.purchasePrice ?? null,
        });
        while (this.componentsArray.length) this.componentsArray.removeAt(0);
        product.components.forEach((c) => {
          this.componentsArray.push(
            this.fb.group({
              componentProductId: [c.componentProductId, Validators.required],
              quantity: [c.quantity, [Validators.required, Validators.min(0.01)]],
            }),
          );
        });
        this.buildPricesFormArray(types, product.productPrices);
        this.photoService.loadPhoto(product.photo);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar el producto.',
          life: 5000,
        });
        this.router.navigate(['/products']);
      },
    });
  }

  override onSubmit(): void {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor, complete todos los campos requeridos.',
        life: 5000,
      });
      return;
    }

    const value = this.form.getRawValue() as ProductFormData;
    const components: ProductComponentInput[] = value.composite
      ? value.components.map((c) => ({
          componentProductId: c.componentProductId!,
          quantity: c.quantity,
        }))
      : [];

    const payload = {
      code: value.code?.trim() || undefined,
      name: value.name,
      categoryId: value.categoryId!,
      description: value.description || undefined,
      active: value.active,
      composite: value.composite,
      purchasePrice: value.purchasePrice ?? undefined,
      components,
      productPrices: value.productPrices.map((p) => ({
        priceTypeId: p.priceTypeId,
        price: p.price,
        profitMargin: p.profitMargin ?? null,
      })),
    };

    if (this.isEditMode() && this.entityId()) {
      this.service
        .update(this.entityId()!, payload)
        .pipe(
          switchMap((product) => {
            if (value.photo) {
              return this.photoService.uploadPhoto(product?.id ?? this.entityId()!, value.photo);
            }
            return of(undefined);
          }),
        )
        .subscribe({
          next: () => {
            this.markAsSubmitted();
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Producto actualizado exitosamente',
              life: 3000,
            });
            this.router.navigate(['/products']);
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al actualizar el producto.',
              life: 5000,
            });
          },
        });
    } else {
      this.service
        .create(payload)
        .pipe(
          switchMap((product) => {
            if (value.photo && product?.id) {
              return this.photoService.uploadPhoto(product.id, value.photo);
            }
            return of(undefined);
          }),
        )
        .subscribe({
          next: () => {
            this.markAsSubmitted();
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Producto creado exitosamente',
              life: 3000,
            });
            this.router.navigate(['/products']);
          },
          error: (err: { error?: { message?: string } }) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err?.error?.message || 'Error al crear el producto.',
              life: 5000,
            });
          },
        });
    }
  }
}
