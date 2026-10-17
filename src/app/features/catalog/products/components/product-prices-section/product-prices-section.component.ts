import { Component, input, inject, signal, ChangeDetectionStrategy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormArray,
  FormControl,
  AbstractControl,
} from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { PriceTypeApplicationService } from '@features/catalog/price-types/services/application/price-type-application.service';

@Component({
  selector: 'app-product-prices-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, InputNumberModule, ButtonModule],
  templateUrl: './product-prices-section.component.html',
})
export class ProductPricesSectionComponent {
  private readonly priceTypeService = inject(PriceTypeApplicationService);

  readonly form = input.required<FormGroup>();
  readonly collapsed = signal(false);
  readonly priceTypes = this.priceTypeService.priceTypes;
  readonly pricesControls = signal<AbstractControl[]>([]);

  constructor() {
    effect((onCleanup) => {
      const arr = this.form().get('productPrices') as FormArray;
      this.pricesControls.set([...arr.controls]);

      const sub = arr.valueChanges.subscribe(() => {
        if (this.pricesControls().length !== arr.controls.length) {
          this.pricesControls.set([...arr.controls]);
        }
      });

      onCleanup(() => sub.unsubscribe());
    });
  }

  get pricesArray(): FormArray {
    return this.form().get('productPrices') as FormArray;
  }

  getPriceTypeName(index: number): string {
    const control = this.pricesControls()[index] as FormGroup;
    const priceTypeId = control.get('priceTypeId')?.value as string;
    return this.priceTypes().find((pt) => pt.id === priceTypeId)?.name ?? '';
  }

  getPriceControl(index: number): FormControl {
    return (this.pricesControls()[index] as FormGroup).get('price') as FormControl;
  }

  toggleCollapsed(): void {
    this.collapsed.update((v) => !v);
  }

  getProfitMarginControl(index: number): FormControl {
    return (this.pricesControls()[index] as FormGroup).get('profitMargin') as FormControl;
  }

  calculateAll(): void {
    const purchasePrice = this.form().get('purchasePrice')?.value as number | null;
    if (purchasePrice == null) return;

    this.pricesArray.controls.forEach((control) => {
      const group = control as FormGroup;
      const profitMargin = group.get('profitMargin')?.value as number | null;
      if (profitMargin == null) return;
      const calculatedPrice = purchasePrice * (1 + profitMargin / 100);
      group.get('price')?.setValue(Math.round(calculatedPrice * 100) / 100);
    });
  }
}
