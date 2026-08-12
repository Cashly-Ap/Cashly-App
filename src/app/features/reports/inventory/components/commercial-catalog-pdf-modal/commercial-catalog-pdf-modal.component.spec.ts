import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NO_ERRORS_SCHEMA, Component } from '@angular/core';
import { CommercialCatalogPdfModalComponent } from './commercial-catalog-pdf-modal.component';
import { CategoryApplicationService } from '@features/categories/services/application';
import { PriceTypeApplicationService } from '@features/price-types/services/application/price-type-application.service';

@Component({
  template: `<app-commercial-catalog-pdf-modal
    [visible]="visible"
    (visibleChange)="onVisibleChange($event)"
    (onGeneratePdf)="onGeneratePdf($event)"
  ></app-commercial-catalog-pdf-modal>`,
  imports: [CommercialCatalogPdfModalComponent],
})
class HostComponent {
  visible = false;
  onVisibleChange = vi.fn();
  onGeneratePdf = vi.fn();
}

function createMockCategoryService() {
  return {
    categories: vi.fn(() => []),
    loadAll: vi.fn(() => ({ subscribe: vi.fn() })),
  };
}

function createMockPriceTypeService() {
  return {
    priceTypes: vi.fn(() => []),
    loadAll: vi.fn(() => ({ subscribe: vi.fn() })),
  };
}

describe('CommercialCatalogPdfModalComponent', () => {
  let hostComponent: HostComponent;
  let fixture: ComponentFixture<HostComponent>;
  let component: CommercialCatalogPdfModalComponent;
  let mockCategoryService: ReturnType<typeof createMockCategoryService>;
  let mockPriceTypeService: ReturnType<typeof createMockPriceTypeService>;

  beforeEach(() => {
    mockCategoryService = createMockCategoryService();
    mockPriceTypeService = createMockPriceTypeService();

    TestBed.configureTestingModule({
      imports: [HostComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: CategoryApplicationService, useValue: mockCategoryService },
        { provide: PriceTypeApplicationService, useValue: mockPriceTypeService },
      ],
    });

    TestBed.compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
    component = fixture.debugElement.children[0].componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default visible input as false', () => {
    expect(component.visible()).toBe(false);
  });

  it('should have default search signal as empty string', () => {
    expect(component.search()).toBe('');
  });

  it('should have default categoryId signal as null', () => {
    expect(component.categoryId()).toBeNull();
  });

  it('should have default priceTypeId signal as null', () => {
    expect(component.priceTypeId()).toBeNull();
  });

  it('should call loadAll for categories and priceTypes on loadFilters', () => {
    component.loadFilters();
    expect(mockCategoryService.loadAll).toHaveBeenCalledWith({ size: 1000 });
    expect(mockPriceTypeService.loadAll).toHaveBeenCalled();
  });

  it('should emit onGeneratePdf with filters on generatePdf', () => {
    component.search.set('test');
    component.categoryId.set('cat-1');
    component.priceTypeId.set('pt-1');
    component.active.set(false);

    component.generatePdf();

    expect(hostComponent.onGeneratePdf).toHaveBeenCalledWith({
      search: 'test',
      categoryId: 'cat-1',
      priceTypeId: 'pt-1',
      active: false,
    });
  });

  it('should emit undefined for empty values on generatePdf', () => {
    component.generatePdf();
    expect(hostComponent.onGeneratePdf).toHaveBeenCalledWith({
      search: undefined,
      categoryId: undefined,
      priceTypeId: undefined,
      active: true,
    });
  });

  it('should compute priceTypeOptions from priceTypeService', () => {
    mockPriceTypeService.priceTypes.mockReturnValue([
      { id: 'pt-1', name: 'Minorista' },
      { id: 'pt-2', name: 'Mayorista' },
    ]);
    mockCategoryService.categories.mockReturnValue([]);
    mockCategoryService.loadAll.mockReturnValue({ subscribe: vi.fn() });
    mockPriceTypeService.loadAll.mockReturnValue({ subscribe: vi.fn() });

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const c = fixture.debugElement.children[0].componentInstance;

    const options = c.priceTypeOptions();
    expect(options).toHaveLength(3);
    expect(options[0].label).toBe('Sin precio');
    expect(options[1].label).toBe('Minorista');
    expect(options[2].label).toBe('Mayorista');
  });
});
