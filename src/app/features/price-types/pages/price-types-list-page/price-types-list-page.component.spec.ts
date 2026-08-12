import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Router, provideRouter } from '@angular/router';
import { signal, NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PriceTypesListPageComponent } from '@features/price-types/pages/price-types-list-page/price-types-list-page.component';
import { PriceTypeApplicationService } from '@features/price-types/services/application/price-type-application.service';
import { PriceTypeList } from '@features/price-types/models/interfaces';
import { CatalogPdfApiService } from '@features/reports/inventory/services/api/catalog-pdf-api.service';
import { StockPdfApiService } from '@features/reports/inventory/services/api/stock-pdf-api.service';
import { MovementsPdfApiService } from '@features/reports/inventory/services/api/movements-pdf-api.service';
import { OrderPdfApiService } from '@features/reports/orders/services/api/order-pdf-api.service';
import { InvoicePdfApiService } from '@features/reports/invoices/services/api/invoice-pdf-api.service';
import { QuotePdfApiService } from '@features/reports/quotes/services/api/quote-pdf-api.service';

describe('PriceTypesListPageComponent', () => {
  let component: PriceTypesListPageComponent;
  let fixture: ComponentFixture<PriceTypesListPageComponent>;
  let mockService: Partial<PriceTypeApplicationService>;
  let router: Router;
  let confirmationService: ConfirmationService;
  let messageService: MessageService;

  const mockPriceType: PriceTypeList = {
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

  beforeEach(async () => {
    mockService = {
      loadAll: vi.fn().mockReturnValue(of([mockPriceType])),
      remove: vi.fn().mockReturnValue(of(undefined)),
      priceTypes: signal([mockPriceType]),
      isLoading: signal(false),
      error: signal(null),
    };

    await TestBed.configureTestingModule({
      imports: [PriceTypesListPageComponent],
      providers: [
        provideRouter([]),
        { provide: PriceTypeApplicationService, useValue: mockService },
        ConfirmationService,
        MessageService,
        ...pdfMocks,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PriceTypesListPageComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    confirmationService = TestBed.inject(ConfirmationService);
    messageService = TestBed.inject(MessageService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load all price types on init', () => {
    fixture.detectChanges();
    expect(mockService.loadAll).toHaveBeenCalledWith('name', 'asc');
  });

  it('should filter price types by name', () => {
    fixture.detectChanges();
    component.onSearch('Retail');
    expect(component.filteredPriceTypes()).toHaveLength(1);
    expect(component.filteredPriceTypes()[0].name).toBe('Retail');
  });

  it('should return empty filtered list when no match', () => {
    fixture.detectChanges();
    component.onSearch('nonexistent');
    expect(component.filteredPriceTypes()).toHaveLength(0);
  });

  it('should return all price types when search term is empty', () => {
    fixture.detectChanges();
    component.onSearch('');
    expect(component.filteredPriceTypes()).toEqual([mockPriceType]);
  });

  it('should show initial loading when loading and no data', () => {
    mockService.isLoading = signal(true);
    mockService.priceTypes = signal([]);
    fixture = TestBed.createComponent(PriceTypesListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.showInitialLoading()).toBe(true);
  });

  it('should show empty state when not loading and no data', () => {
    mockService.priceTypes = signal([]);
    fixture = TestBed.createComponent(PriceTypesListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.isEmptyDatabase()).toBe(true);
  });

  it('should show filtered results message when search has no matches', () => {
    fixture.detectChanges();
    component.onSearch('nonexistent');
    expect(component.hasFilteredResults()).toBe(true);
  });

  it('should navigate to new price type on onCreate', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onCreate();
    expect(navigateSpy).toHaveBeenCalledWith(['/price-types', 'new']);
  });

  it('should navigate to price type detail on onView', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onView(mockPriceType);
    expect(navigateSpy).toHaveBeenCalledWith(['/price-types', mockPriceType.id]);
  });

  it('should navigate to price type edit on onEdit', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onEdit(mockPriceType);
    expect(navigateSpy).toHaveBeenCalledWith(['/price-types', mockPriceType.id, 'edit']);
  });

  it('should update order by and order dir on sort', () => {
    fixture.detectChanges();
    component.onSort({ field: 'name', order: -1 } as any);
    expect(component.orderBy()).toBe('name');
    expect(component.orderDir()).toBe('desc');
  });

  it('should not reload on sort if same field and direction', () => {
    fixture.detectChanges();
    const loadAllSpy = mockService.loadAll as ReturnType<typeof vi.fn>;
    loadAllSpy.mockClear();
    component.onSort({ field: 'name', order: 1 } as any);
    expect(loadAllSpy).not.toHaveBeenCalled();
  });
});
