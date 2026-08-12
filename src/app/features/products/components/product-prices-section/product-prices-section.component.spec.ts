import { ComponentFixture, TestBed, TestBedStatic } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NO_ERRORS_SCHEMA, Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { of } from 'rxjs';
import { ProductPricesSectionComponent } from '@features/products/components/product-prices-section/product-prices-section.component';
import { PriceTypeApplicationService } from '@features/price-types/services/application/price-type-application.service';

@Component({
  standalone: true,
  imports: [ProductPricesSectionComponent, ReactiveFormsModule],
  template: `<app-product-prices-section [form]="form" />`,
})
class HostComponent {
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      purchasePrice: [1000],
      productPrices: this.fb.array([
        this.fb.group({ priceTypeId: ['pt-001'], price: [1200], profitMargin: [20] }),
        this.fb.group({ priceTypeId: ['pt-002'], price: [1100], profitMargin: [10] }),
      ]),
    });
  }
}

describe('ProductPricesSectionComponent', () => {
  let hostComponent: HostComponent;
  let fixture: ComponentFixture<HostComponent>;
  let sectionComponent: ProductPricesSectionComponent;
  let mockPriceTypeService: Partial<PriceTypeApplicationService>;

  function configureTestBed() {
    mockPriceTypeService = {
      loadAll: vi.fn().mockReturnValue(of(undefined)),
      priceTypes: signal([
        { id: 'pt-001', name: 'Retail', active: true },
        { id: 'pt-002', name: 'Wholesale', active: true },
      ]),
    };

    TestBed.configureTestingModule({
      imports: [HostComponent, ProductPricesSectionComponent],
      providers: [{ provide: PriceTypeApplicationService, useValue: mockPriceTypeService }],
      schemas: [NO_ERRORS_SCHEMA],
    });

    TestBed.compileComponents();
  }

  function createHostComponent() {
    fixture = TestBed.createComponent(HostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
    sectionComponent = fixture.debugElement.children[0].componentInstance;
  }

  beforeEach(() => {
    (TestBed as TestBedStatic).resetTestingModule();
    configureTestBed();
    createHostComponent();
  });

  it('should create', () => {
    expect(sectionComponent).toBeTruthy();
  });

  it('should have collapsed signal defaulting to false', () => {
    expect(sectionComponent.collapsed()).toBe(false);
  });

  it('should expose priceTypes from service', () => {
    expect(sectionComponent.priceTypes().length).toBe(2);
  });

  it('should return price type name for index', () => {
    const name = sectionComponent.getPriceTypeName(0);
    expect(name).toBe('Retail');
  });

  it('should return empty string for unknown price type id', () => {
    const pricesArray = sectionComponent.pricesArray;
    pricesArray.at(0).get('priceTypeId')?.setValue('unknown');
    const name = sectionComponent.getPriceTypeName(0);
    expect(name).toBe('');
  });

  it('should return price control for index', () => {
    const control = sectionComponent.getPriceControl(0);
    expect(control).toBeDefined();
    expect(control.value).toBe(1200);
  });

  it('should toggle collapsed state', () => {
    sectionComponent.toggleCollapsed();
    expect(sectionComponent.collapsed()).toBe(true);
    sectionComponent.toggleCollapsed();
    expect(sectionComponent.collapsed()).toBe(false);
  });

  it('should calculate all prices from purchasePrice and individual profitMargins', () => {
    sectionComponent.calculateAll();
    const pricesArray = sectionComponent.pricesArray;
    // purchasePrice 1000, Base profitMargin 20 => 1200
    expect(pricesArray.at(0).get('price')?.value).toBe(1200);
    // purchasePrice 1000, Mayor profitMargin 10 => 1100
    expect(pricesArray.at(1).get('price')?.value).toBe(1100);
  });

  it('should not calculate when purchasePrice is null', () => {
    hostComponent.form.get('purchasePrice')?.setValue(null);
    fixture.detectChanges();
    const pricesArray = sectionComponent.pricesArray;
    const originalPrice0 = pricesArray.at(0).get('price')?.value;
    sectionComponent.calculateAll();
    expect(pricesArray.at(0).get('price')?.value).toBe(originalPrice0);
  });

  it('should skip prices with null profitMargin', () => {
    const pricesArray = sectionComponent.pricesArray;
    pricesArray.at(0).get('profitMargin')?.setValue(null);
    fixture.detectChanges();
    const originalPrice0 = pricesArray.at(0).get('price')?.value;
    const originalPrice1 = pricesArray.at(1).get('price')?.value;
    sectionComponent.calculateAll();
    expect(pricesArray.at(0).get('price')?.value).toBe(originalPrice0);
    expect(pricesArray.at(1).get('price')?.value).toBe(1100);
  });

  it('should access pricesArray getter', () => {
    expect(sectionComponent.pricesArray).toBeDefined();
    expect(sectionComponent.pricesArray.length).toBe(2);
  });

  it('should update pricesControls when prices array changes', () => {
    const pricesArray = sectionComponent.pricesArray;
    const initialLength = sectionComponent.pricesControls().length;
    pricesArray.push(
      hostComponent['fb'].group({ priceTypeId: ['pt-003'], price: [200], profitMargin: [15] }),
    );
    fixture.detectChanges();
    expect(sectionComponent.pricesControls().length).toBe(initialLength + 1);
  });
});
