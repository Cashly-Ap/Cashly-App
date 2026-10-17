import {
  Component,
  input,
  output,
  computed,
  OnInit,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormArray, FormGroup, FormControl } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { ProductApplicationService } from '@features/catalog/products/services/application/product-application.service';
import { EmptyStateComponent } from '@shared/components/ui/empty-state/empty-state.component';

interface ProductOption {
  id: string;
  label: string;
}

@Component({
  selector: 'app-product-composition-section',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputNumberModule,
    SelectModule,
    TableModule,
    TooltipModule,
    EmptyStateComponent,
  ],
  templateUrl: './product-composition-section.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCompositionSectionComponent implements OnInit {
  private readonly productService = inject(ProductApplicationService);

  readonly componentsArray = input.required<FormArray>();
  readonly currentProductId = input<string | null>(null);

  readonly addComponent = output<void>();
  readonly removeComponent = output<number>();

  readonly productOptions = computed<ProductOption[]>(() =>
    this.productService
      .simpleProducts()
      .filter((p) => p.id !== this.currentProductId())
      .map((p) => ({ id: p.id, label: p.name })),
  );

  ngOnInit(): void {
    this.productService.loadSimpleProducts().subscribe();
  }

  getAvailableProductOptions(currentIndex: number): ProductOption[] {
    const allOptions = this.productOptions();
    const selectedIds = this.getSelectedProductIds(currentIndex);
    return allOptions.filter((option) => !selectedIds.includes(option.id));
  }

  private getSelectedProductIds(excludeIndex: number): string[] {
    const ids: string[] = [];
    this.componentsArray().controls.forEach((control, index) => {
      if (index !== excludeIndex) {
        const productId = (control as FormGroup).get('componentProductId')?.value;
        if (productId) ids.push(productId);
      }
    });
    return ids;
  }

  getComponentGroup(index: number): FormGroup {
    return this.componentsArray().at(index) as FormGroup;
  }

  getControl(index: number, field: string): FormControl {
    return this.getComponentGroup(index).get(field) as FormControl;
  }

  onAddComponent(): void {
    this.addComponent.emit();
  }

  onRemoveComponent(index: number): void {
    this.removeComponent.emit(index);
  }
}
