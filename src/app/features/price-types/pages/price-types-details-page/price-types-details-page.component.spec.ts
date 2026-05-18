import { ComponentFixture, TestBed, TestBedStatic } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { signal, NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { PriceTypesDetailsPageComponent } from './price-types-details-page.component';
import { PriceTypeApplicationService } from '@features/price-types/services/application/price-type-application.service';
import { PriceTypeDetails } from '@features/price-types/models/interfaces';
import { CatalogPdfApiService } from '@features/reports/inventory/services/api/catalog-pdf-api.service';
import { StockPdfApiService } from '@features/reports/inventory/services/api/stock-pdf-api.service';
import { MovementsPdfApiService } from '@features/reports/inventory/services/api/movements-pdf-api.service';
import { OrderPdfApiService } from '@features/reports/orders/services/api/order-pdf-api.service';
import { InvoicePdfApiService } from '@features/reports/invoices/services/api/invoice-pdf-api.service';
import { QuotePdfApiService } from '@features/reports/quotes/services/api/quote-pdf-api.service';

describe('PriceTypesDetailsPageComponent', () => {
  let component: PriceTypesDetailsPageComponent;
  let fixture: ComponentFixture<PriceTypesDetailsPageComponent>;
  let mockService: Partial<PriceTypeApplicationService>;
  let router: Router;
  let messageService: MessageService;

  const mockPriceType: PriceTypeDetails = {
    id: 'pt-001',
    name: 'Retail',
    active: true,
  };

  const pdfMocks = [
    { provide: CatalogPdfApiService, useValue: { downloadPdf: vi.fn() } },
    { provide: StockPdfApiService, useValue: { getPdf: vi.fn() } },
    { provide: MovementsPdfApiService, useValue: { getPdf: vi.fn() } },
    { provide: OrderPdfApiService, useValue: { downloadOrdersReportPdf: vi.fn() } },
    { provide: InvoicePdfApiService, useValue: { downloadInvoicesReportPdf: vi.fn() } },
    { provide: QuotePdfApiService, useValue: { downloadQuotesReportPdf: vi.fn() } },
  ];

  function configureTestBed(id: string | null = 'pt-001', loadByIdValue: any = of(mockPriceType)) {
    mockService = {
      loadAll: vi.fn().mockReturnValue(of([])),
      loadById: vi.fn().mockReturnValue(loadByIdValue),
      create: vi.fn().mockReturnValue(of(mockPriceType)),
      update: vi.fn().mockReturnValue(of(mockPriceType)),
      remove: vi.fn().mockReturnValue(of(undefined)),
      priceTypes: signal([]),
      selectedPriceType: signal(null),
      isLoading: signal(false),
      error: signal(null),
    };

    TestBed.configureTestingModule({
      imports: [PriceTypesDetailsPageComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => id } } } },
        { provide: PriceTypeApplicationService, useValue: mockService },
        MessageService,
        ...pdfMocks,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    TestBed.compileComponents();
  }

  function createComponent() {
    fixture = TestBed.createComponent(PriceTypesDetailsPageComponent);
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

  it('should have null priceType initially', () => {
    expect(component.priceType()).toBeNull();
  });

  it('should not be loading initially', () => {
    expect(component.loading()).toBe(false);
  });

  it('should load price type on init', () => {
    fixture.detectChanges();
    expect(mockService.loadById).toHaveBeenCalledWith('pt-001');
  });

  it('should set priceType on load success', () => {
    fixture.detectChanges();
    expect(component.priceType()?.id).toBe('pt-001');
    expect(component.priceType()?.name).toBe('Retail');
  });

  it('should set loading to false after load', () => {
    fixture.detectChanges();
    expect(component.loading()).toBe(false);
  });

  it('should show error message and navigate on load failure', () => {
    (TestBed as TestBedStatic).resetTestingModule();
    configureTestBed('pt-999', throwError(() => new Error('Not found')));
    createComponent();

    const addSpy = vi.spyOn(messageService, 'add');
    const navigateSpy = vi.spyOn(router, 'navigate');

    fixture.detectChanges();

    expect(addSpy).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Error al cargar el tipo de precio.',
      life: 5000,
    });
    expect(navigateSpy).toHaveBeenCalledWith(['/price-types']);
  });

  it('should navigate to /price-types/{id}/edit on onEdit', () => {
    component.priceType.set(mockPriceType);
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onEdit();
    expect(navigateSpy).toHaveBeenCalledWith(['/price-types', 'pt-001', 'edit']);
  });

  it('should not navigate on onEdit if priceType is null', () => {
    component.priceType.set(null);
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onEdit();
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('should navigate to /price-types on onBack', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onBack();
    expect(navigateSpy).toHaveBeenCalledWith(['/price-types']);
  });

  it('should not load price type if id is null', () => {
    (TestBed as TestBedStatic).resetTestingModule();
    configureTestBed(null);
    createComponent();
    fixture.detectChanges();

    expect(mockService.loadById).not.toHaveBeenCalled();
  });
});
