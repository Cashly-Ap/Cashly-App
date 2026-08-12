import { ComponentFixture, TestBed, TestBedStatic } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { signal, NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { CategoriesDetailsPageComponent } from '@features/categories/pages/categories-details-page/categories-details-page.component';
import { CategoryApplicationService } from '@features/categories/services/application';
import { CategoryDetails } from '@features/categories/models/interfaces';
import { CatalogPdfApiService } from '@features/reports/inventory/services/api/catalog-pdf-api.service';
import { StockPdfApiService } from '@features/reports/inventory/services/api/stock-pdf-api.service';
import { MovementsPdfApiService } from '@features/reports/inventory/services/api/movements-pdf-api.service';
import { OrderPdfApiService } from '@features/reports/orders/services/api/order-pdf-api.service';
import { InvoicePdfApiService } from '@features/reports/invoices/services/api/invoice-pdf-api.service';
import { QuotePdfApiService } from '@features/reports/quotes/services/api/quote-pdf-api.service';

describe('CategoriesDetailsPageComponent', () => {
  let component: CategoriesDetailsPageComponent;
  let fixture: ComponentFixture<CategoriesDetailsPageComponent>;
  let mockService: Partial<CategoryApplicationService>;
  let router: Router;
  let messageService: MessageService;

  const mockCategory: CategoryDetails = {
    id: 'cat-001',
    name: 'Electronics',
    description: 'Electronic products',
    active: true,
    productCount: 10,
    createdAt: '2025-01-01T00:00:00Z',
  };

  const pdfMocks = [
    { provide: CatalogPdfApiService, useValue: { downloadPdf: vi.fn() } },
    { provide: StockPdfApiService, useValue: { getPdf: vi.fn() } },
    { provide: MovementsPdfApiService, useValue: { getPdf: vi.fn() } },
    { provide: OrderPdfApiService, useValue: { downloadOrdersReportPdf: vi.fn() } },
    { provide: InvoicePdfApiService, useValue: { downloadInvoicesReportPdf: vi.fn() } },
    { provide: QuotePdfApiService, useValue: { downloadQuotesReportPdf: vi.fn() } },
  ];

  function configureTestBed(id: string | null = 'cat-001', loadByIdValue: any = of(mockCategory)) {
    mockService = {
      loadAll: vi
        .fn()
        .mockReturnValue(of({ content: [], totalElements: 0, totalPages: 0, size: 10, number: 0 })),
      loadById: vi.fn().mockReturnValue(loadByIdValue),
      create: vi.fn().mockReturnValue(of(mockCategory)),
      update: vi.fn().mockReturnValue(of(mockCategory)),
      toggleActive: vi.fn().mockReturnValue(of(mockCategory)),
      delete: vi.fn().mockReturnValue(of(undefined)),
      categories: signal([]),
      currentCategory: signal(null),
      loading: signal(false),
      error: signal(null),
      totalElements: signal(0),
    };

    TestBed.configureTestingModule({
      imports: [CategoriesDetailsPageComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => id } } } },
        { provide: CategoryApplicationService, useValue: mockService },
        MessageService,
        ...pdfMocks,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    TestBed.compileComponents();
  }

  function createComponent() {
    fixture = TestBed.createComponent(CategoriesDetailsPageComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    messageService = TestBed.inject(MessageService);
  }

  beforeEach(() => {
    (TestBed as TestBedStatic).resetTestingModule();
    configureTestBed();
    createComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have null category initially', () => {
    expect(component.category()).toBeNull();
  });

  it('should not be loading initially', () => {
    expect(component.loading()).toBe(false);
  });

  it('should load category on init', () => {
    fixture.detectChanges();
    expect(mockService.loadById).toHaveBeenCalledWith('cat-001');
  });

  it('should set category on load success', () => {
    fixture.detectChanges();
    expect(component.category()?.id).toBe('cat-001');
    expect(component.category()?.name).toBe('Electronics');
  });

  it('should set loading to false after load', () => {
    fixture.detectChanges();
    expect(component.loading()).toBe(false);
  });

  it('should show error message and navigate on load failure', () => {
    (TestBed as TestBedStatic).resetTestingModule();
    configureTestBed(
      'cat-999',
      throwError(() => new Error('Not found')),
    );
    createComponent();

    const addSpy = vi.spyOn(messageService, 'add');
    const navigateSpy = vi.spyOn(router, 'navigate');

    fixture.detectChanges();

    expect(addSpy).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Error al cargar la categoría.',
      life: 5000,
    });
    expect(navigateSpy).toHaveBeenCalledWith(['/categories']);
  });

  it('should navigate to /categories/{id}/edit on onEdit', () => {
    component.category.set(mockCategory);
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onEdit();
    expect(navigateSpy).toHaveBeenCalledWith(['/categories', 'cat-001', 'edit']);
  });

  it('should not navigate on onEdit if category is null', () => {
    component.category.set(null);
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onEdit();
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('should navigate to /categories on onBack', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onBack();
    expect(navigateSpy).toHaveBeenCalledWith(['/categories']);
  });

  it('should not load category if id is null', () => {
    (TestBed as TestBedStatic).resetTestingModule();
    configureTestBed(null);
    createComponent();
    fixture.detectChanges();

    expect(mockService.loadById).not.toHaveBeenCalled();
  });
});
