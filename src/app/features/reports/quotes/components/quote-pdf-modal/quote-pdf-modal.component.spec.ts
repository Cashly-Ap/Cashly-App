import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { NO_ERRORS_SCHEMA, Component } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { QuotePdfModalComponent } from '@features/reports/quotes/components/quote-pdf-modal/quote-pdf-modal.component';
import { ProductApiService } from '@features/catalog/products/services/api/product-api.service';
import { CategoryApiService } from '@features/catalog/categories/services/api/category-api.service';

@Component({
  template: `<app-quote-pdf-modal
    [visible]="visible"
    (visibleChange)="onVisibleChange($event)"
    (onGeneratePdf)="onGeneratePdf($event)"
  ></app-quote-pdf-modal>`,
  imports: [QuotePdfModalComponent],
})
class HostComponent {
  visible = false;
  onVisibleChange = vi.fn();
  onGeneratePdf = vi.fn();
}

const PRODUCTS_WITH_DATA = {
  content: [
    { id: 'prod-1', name: 'Product A' },
    { id: 'prod-2', name: 'Product B' },
  ],
};

const CATEGORIES_WITH_DATA = {
  content: [
    { id: 'cat-1', name: 'Category A' },
    { id: 'cat-2', name: 'Category B' },
  ],
};

function setup(overrides: { visible?: boolean } = {}) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [HostComponent],
    schemas: [NO_ERRORS_SCHEMA],
    providers: [provideHttpClient(), provideHttpClientTesting()],
  });
  TestBed.compileComponents();

  const fixture = TestBed.createComponent(HostComponent);
  const hostComponent = fixture.componentInstance;
  const httpTesting = TestBed.inject(HttpTestingController);

  const showVisible = overrides.visible ?? false;
  hostComponent.visible = showVisible;
  fixture.detectChanges();

  const component = fixture.debugElement.children[0].componentInstance as QuotePdfModalComponent;

  if (showVisible) {
    const productReq = httpTesting.expectOne((req) => req.url.includes('/api/products'));
    productReq.flush(PRODUCTS_WITH_DATA);

    const categoryReq = httpTesting.expectOne((req) => req.url.includes('/api/categories'));
    categoryReq.flush(CATEGORIES_WITH_DATA);
  }

  return { fixture, hostComponent, component, httpTesting };
}

describe('QuotePdfModalComponent', () => {
  let hostComponent: HostComponent;
  let component: QuotePdfModalComponent;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    const result = setup();
    hostComponent = result.hostComponent;
    component = result.component;
    httpTesting = result.httpTesting;
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default visible input as false', () => {
    expect(component.visible()).toBe(false);
  });

  it('should have default dateFrom signal as null', () => {
    expect(component.dateFrom()).toBeNull();
  });

  it('should have default dateTo signal as null', () => {
    expect(component.dateTo()).toBeNull();
  });

  it('should have default status signal as null', () => {
    expect(component.status()).toBeNull();
  });

  it('should have default productId signal as null', () => {
    expect(component.productId()).toBeNull();
  });

  it('should have default categoryId signal as null', () => {
    expect(component.categoryId()).toBeNull();
  });

  it('should have default mode signal as SIMPLE', () => {
    expect(component.mode()).toBe('SIMPLE');
  });

  it('should have statusOptions with all statuses', () => {
    const values = component.statusOptions.map((o) => o.value);
    expect(values).toContain(null);
    expect(values).toContain('DRAFT');
    expect(values).toContain('CONVERTED_TO_ORDER');
    expect(values).toContain('CONVERTED_TO_INVOICE');
    expect(values).toContain('CANCELLED');
  });

  it('should have modeOptions with 2 options', () => {
    expect(component.modeOptions).toHaveLength(2);
    expect(component.modeOptions[0].value).toBe('SIMPLE');
    expect(component.modeOptions[1].value).toBe('DETAILED');
  });

  it('should have default productOptions with "Todos los productos"', () => {
    expect(component.productOptions()).toHaveLength(1);
    expect(component.productOptions()[0].label).toBe('Todos los productos');
  });

  it('should have default categoryOptions with "Todas las categorías"', () => {
    expect(component.categoryOptions()).toHaveLength(1);
    expect(component.categoryOptions()[0].label).toBe('Todas las categorías');
  });
});

describe('QuotePdfModalComponent - with data', () => {
  let hostComponent: HostComponent;
  let component: QuotePdfModalComponent;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    const result = setup({ visible: true });
    hostComponent = result.hostComponent;
    component = result.component;
    httpTesting = result.httpTesting;
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should have visible input as true', () => {
    expect(component.visible()).toBe(true);
  });

  it('should populate productOptions from API response', () => {
    const options = component.productOptions();
    expect(options).toHaveLength(3);
    expect(options[0].label).toBe('Todos los productos');
    expect(options[1].label).toBe('Product A');
    expect(options[2].label).toBe('Product B');
  });

  it('should populate categoryOptions from API response', () => {
    const options = component.categoryOptions();
    expect(options).toHaveLength(3);
    expect(options[0].label).toBe('Todas las categorías');
    expect(options[1].label).toBe('Category A');
    expect(options[2].label).toBe('Category B');
  });

  it('should emit visibleChange with false on onHide', () => {
    component.onHide();
    expect(hostComponent.onVisibleChange).toHaveBeenCalledWith(false);
  });

  it('should emit onGeneratePdf with formatted dates on generatePdf', () => {
    component.dateFrom.set(new Date('2025-04-15'));
    component.dateTo.set(new Date('2025-09-30'));
    component.status.set('DRAFT');
    component.productId.set('prod-1');
    component.categoryId.set('cat-1');
    component.mode.set('DETAILED');

    component.generatePdf();

    expect(hostComponent.onGeneratePdf).toHaveBeenCalledWith({
      dateFrom: '2025-04-15',
      dateTo: '2025-09-30',
      status: 'DRAFT',
      productId: 'prod-1',
      categoryId: 'cat-1',
      mode: 'DETAILED',
    });
  });

  it('should emit undefined for null dates on generatePdf', () => {
    component.generatePdf();
    expect(hostComponent.onGeneratePdf).toHaveBeenCalledWith({
      dateFrom: undefined,
      dateTo: undefined,
      status: undefined,
      productId: undefined,
      categoryId: undefined,
      mode: 'SIMPLE',
    });
  });

  it('should emit visibleChange with false on generatePdf', () => {
    component.generatePdf();
    expect(hostComponent.onVisibleChange).toHaveBeenCalledWith(false);
  });

  it('should format date correctly', () => {
    component.dateFrom.set(new Date('2025-11-08'));
    component.generatePdf();
    expect(hostComponent.onGeneratePdf).toHaveBeenCalledWith(
      expect.objectContaining({ dateFrom: '2025-11-08' }),
    );
  });
});
