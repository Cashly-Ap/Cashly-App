import { provideRouter } from '@angular/router';
import { AuthorizationService } from '@features/platform/auth/authorization/services/authorization.service';
import { ComponentFixture, TestBed, TestBedStatic } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NO_ERRORS_SCHEMA, Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { of } from 'rxjs';
import { ProductCompositionSectionComponent } from '@features/catalog/products/components/product-composition-section/product-composition-section.component';
import { ProductApplicationService } from '@features/catalog/products/services/application/product-application.service';
import { ProductList } from '@features/catalog/products/models/interfaces/product-list.interface';

const mockSimpleProducts: ProductList[] = [
  {
    id: 'prod-001',
    code: 'P001',
    name: 'Product A',
    categoryId: 'cat-001',
    categoryName: 'Cat 1',
    composite: false,
    active: true,
    productPrices: [],
  },
  {
    id: 'prod-002',
    code: 'P002',
    name: 'Product B',
    categoryId: 'cat-001',
    categoryName: 'Cat 1',
    composite: false,
    active: true,
    productPrices: [],
  },
  {
    id: 'prod-003',
    code: 'P003',
    name: 'Product C',
    categoryId: 'cat-002',
    categoryName: 'Cat 2',
    composite: false,
    active: true,
    productPrices: [],
  },
];

function createHostComponentClass(currentProductId: string | null = null) {
  @Component({
    standalone: true,
    imports: [ProductCompositionSectionComponent, ReactiveFormsModule],
    template: `
      <app-product-composition-section
        [componentsArray]="componentsArray"
        [currentProductId]="currentProductId"
        (addComponent)="onAddComponent()"
        (removeComponent)="onRemoveComponent($event)"
      />
    `,
  })
  class HostComponent {
    componentsArray: FormArray;
    currentProductId = currentProductId;
    onAddComponent = vi.fn();
    onRemoveComponent = vi.fn();

    constructor(private fb: FormBuilder) {
      this.componentsArray = this.fb.array([
        this.fb.group({ componentProductId: ['prod-001'], quantity: [2] }),
        this.fb.group({ componentProductId: ['prod-002'], quantity: [1] }),
      ]);
    }
  }
  return HostComponent;
}

describe('ProductCompositionSectionComponent', () => {
  let hostComponent: any;
  let fixture: ComponentFixture<any>;
  let sectionComponent: ProductCompositionSectionComponent;
  let mockProductService: Partial<ProductApplicationService>;

  function configureTestBed(HostClass: any) {
    mockProductService = {
      loadAll: vi.fn().mockReturnValue(of({ content: [], totalElements: 0 })),
      loadSimpleProducts: vi.fn().mockReturnValue(of(undefined)),
      simpleProducts: signal(mockSimpleProducts),
      products: signal(mockSimpleProducts),
      currentProduct: signal(null),
      loading: signal(false),
      error: signal(null),
      totalElements: signal(0),
    };

    TestBed.configureTestingModule({
      imports: [HostClass, ProductCompositionSectionComponent],
      providers: [
        provideRouter([]),
        { provide: AuthorizationService, useValue: { can: () => true } },
        { provide: ProductApplicationService, useValue: mockProductService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    TestBed.compileComponents();
  }

  function createHostComponent(HostClass: any) {
    fixture = TestBed.createComponent(HostClass);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
    sectionComponent = fixture.debugElement.children[0].componentInstance;
  }

  beforeEach(() => {
    (TestBed as TestBedStatic).resetTestingModule();
    const HostClass = createHostComponentClass();
    configureTestBed(HostClass);
    createHostComponent(HostClass);
  });

  it('should create', () => {
    expect(sectionComponent).toBeTruthy();
  });

  it('should load simple products on init', () => {
    expect(mockProductService.loadSimpleProducts).toHaveBeenCalled();
  });

  it('should generate product options excluding current product', () => {
    (TestBed as TestBedStatic).resetTestingModule();
    const HostClass = createHostComponentClass('prod-001');
    configureTestBed(HostClass);
    createHostComponent(HostClass);
    const options = sectionComponent.productOptions();
    expect(options).toHaveLength(2);
    expect(options.find((o) => o.id === 'prod-001')).toBeUndefined();
    expect(options.find((o) => o.id === 'prod-002')).toBeDefined();
    expect(options.find((o) => o.id === 'prod-003')).toBeDefined();
  });

  it('should include all products when currentProductId is null', () => {
    const options = sectionComponent.productOptions();
    expect(options).toHaveLength(3);
  });

  it('should return available product options excluding selected ones', () => {
    const available = sectionComponent.getAvailableProductOptions(0);
    expect(available.find((o) => o.id === 'prod-001')).toBeDefined();
    expect(available.find((o) => o.id === 'prod-002')).toBeUndefined();
  });

  it('should exclude current row selection when getting available options', () => {
    const available = sectionComponent.getAvailableProductOptions(1);
    expect(available.find((o) => o.id === 'prod-002')).toBeDefined();
    expect(available.find((o) => o.id === 'prod-001')).toBeUndefined();
  });

  it('should return component group for index', () => {
    const group = sectionComponent.getComponentGroup(0);
    expect(group).toBeDefined();
    expect(group.get('componentProductId')?.value).toBe('prod-001');
  });

  it('should return control for index and field', () => {
    const control = sectionComponent.getControl(0, 'quantity');
    expect(control).toBeDefined();
    expect(control.value).toBe(2);
  });

  it('should return componentProductId control', () => {
    const control = sectionComponent.getControl(0, 'componentProductId');
    expect(control.value).toBe('prod-001');
  });

  it('should emit addComponent on onAddComponent', () => {
    sectionComponent.onAddComponent();
    expect(hostComponent.onAddComponent).toHaveBeenCalled();
  });

  it('should emit removeComponent with index on onRemoveComponent', () => {
    sectionComponent.onRemoveComponent(1);
    expect(hostComponent.onRemoveComponent).toHaveBeenCalledWith(1);
  });
});
