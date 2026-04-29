import { Component, input, inject, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormArray, FormControl } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { PriceTypeApplicationService } from '@features/price-types/services/application/price-type-application.service';

@Component({
  selector: 'app-product-prices-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputNumberModule,
    ButtonModule,
  ],
  templateUrl: './product-prices-section.component.html',
})
export class ProductPricesSectionComponent {
  private readonly priceTypeService = inject(PriceTypeApplicationService);

  readonly form = input.required<FormGroup>();

  readonly collapsed = signal(false);

  readonly priceTypes = this.priceTypeService.priceTypes;

  get pricesArray(): FormArray {
    return this.form().get('productPrices') as FormArray;
  }

  getPriceTypeName(index: number): string {
    const control = this.pricesArray.at(index) as FormGroup;
    const priceTypeId = control.get('priceTypeId')?.value as string;
    return this.priceTypes().find((pt) => pt.id === priceTypeId)?.name ?? '';
  }

  getPriceControl(index: number): FormControl {
    return (this.pricesArray.at(index) as FormGroup).get('price') as FormControl;
  }

  toggleCollapsed(): void {
    this.collapsed.update((v) => !v);
  }

  calculateAll(): void {
    const basePrice = this.form().get('basePrice')?.value as number | null;
    const profitMargin = this.form().get('profitMargin')?.value as number | null;

    if (basePrice == null || profitMargin == null) return;

    const calculatedPrice = basePrice * (1 + profitMargin / 100);

    this.pricesArray.controls.forEach((control) => {
      (control as FormGroup).get('price')?.setValue(
        Math.round(calculatedPrice * 100) / 100,
      );
    });
  }
}
