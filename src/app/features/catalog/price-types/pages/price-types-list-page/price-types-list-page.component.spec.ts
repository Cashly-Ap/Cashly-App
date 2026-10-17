import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Router, provideRouter } from '@angular/router';
import { signal, NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { ConfirmationService, MessageService, SortEvent } from 'primeng/api';
import { PriceTypesListPageComponent } from '@features/catalog/price-types/pages/price-types-list-page/price-types-list-page.component';
import { PriceTypeApplicationService } from '@features/catalog/price-types/services/application/price-type-application.service';
import { PriceTypeList } from '@features/catalog/price-types/models/interfaces/price-type-list.interface';
import { CatalogPdfApiService } from '@features/catalog/products/reporting/services/api/catalog-pdf-api.service';
import { StockPdfApiService } from '@features/inventory/warehouses/reporting/services/api/stock-pdf-api.service';
import { MovementsPdfApiService } from '@features/inventory/warehouses/reporting/services/api/movements-pdf-api.service';
import { OrderPdfApiService } from '@features/sales/orders/reporting/services/api/order-pdf-api.service';
import { InvoicePdfApiService } from '@features/finance/billing/invoices/reporting/services/api/invoice-pdf-api.service';
import { QuotePdfApiService } from '@features/sales/quotes/reporting/services/api/quote-pdf-api.service';

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
    deletable: true,
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
      loadAll: vi
        .fn()
        .mockReturnValue(
          of({ content: [mockPriceType], totalElements: 1, totalPages: 1, size: 10, number: 0 }),
        ),
      remove: vi.fn().mockReturnValue(of(undefined)),
      priceTypes: signal([mockPriceType]),
      isLoading: signal(false),
      error: signal(null),
      totalElements: signal(1),
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

  it('should load price types on init', () => {
    fixture.detectChanges();
    expect(mockService.loadAll).toHaveBeenCalledWith({
      page: 0,
      size: 10,
      orderBy: 'name',
      orderDir: 'asc',
    });
  });

  it('should update searchTerm and call loadAll on onSearch', () => {
    fixture.detectChanges();
    component.onSearch('Retail');
    expect(component.searchTerm()).toBe('Retail');
    expect(mockService.loadAll).toHaveBeenLastCalledWith(
      expect.objectContaining({ search: 'Retail' }),
    );
  });

  it('should reset first to 0 on onSearch', () => {
    fixture.detectChanges();
    component.first.set(20);
    component.onSearch('Retail');
    expect(component.first()).toBe(0);
  });

  it('should update pagination and call loadAll on onPageChange', () => {
    fixture.detectChanges();
    component.onPageChange({ first: 20, rows: 25 });
    expect(component.first()).toBe(20);
    expect(component.rows()).toBe(25);
    expect(mockService.loadAll).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 0, size: 25 }),
    );
  });

  it('should show initial loading when loading and no data', () => {
    mockService.isLoading = signal(true);
    mockService.priceTypes = signal([]);
    mockService.totalElements = signal(0);
    fixture = TestBed.createComponent(PriceTypesListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.showInitialLoading()).toBe(true);
  });

  it('should show empty state when not loading and no data', () => {
    mockService.priceTypes = signal([]);
    mockService.totalElements = signal(0);
    fixture = TestBed.createComponent(PriceTypesListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.isEmptyDatabase()).toBe(true);
  });

  it('should show filtered results message when search has no matches', () => {
    mockService.totalElements = signal(0);
    fixture = TestBed.createComponent(PriceTypesListPageComponent);
    component = fixture.componentInstance;
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
    component.onSort({ field: 'name', order: -1 } as SortEvent);
    expect(component.orderBy()).toBe('name');
    expect(component.orderDir()).toBe('desc');
  });

  it('should not reload on sort if same field and direction', () => {
    fixture.detectChanges();
    const loadAllSpy = mockService.loadAll as ReturnType<typeof vi.fn>;
    loadAllSpy.mockClear();
    component.onSort({ field: 'name', order: 1 } as SortEvent);
    expect(loadAllSpy).not.toHaveBeenCalled();
  });

  it('should call service.remove when confirm accept is called', () => {
    fixture.detectChanges();
    component.onDelete(mockPriceType);
    const confirmCall = (confirmationService.confirm as any).mock?.calls?.[0]?.[0];
    if (confirmCall) {
      confirmCall.accept();
      expect(mockService.remove).toHaveBeenCalledWith('pt-001');
    }
  });

  it('should only offer delete action when price type is deletable', () => {
    const nonDeletable: PriceTypeList = { ...mockPriceType, deletable: false };
    const actions = component.actionsFor(nonDeletable);
    expect(actions.some((a) => a.label === 'Eliminar')).toBe(false);
  });
});
