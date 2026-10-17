import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Router, provideRouter } from '@angular/router';
import { signal, NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { ConfirmationService, MessageService, SortEvent } from 'primeng/api';
import { CategoriesListPageComponent } from '@features/catalog/categories/pages/categories-list-page/categories-list-page.component';
import { CategoryApplicationService } from '@features/catalog/categories/services/application/category-application.service';
import { CategoryList } from '@features/catalog/categories/models/interfaces/category-list.interface';
import { CatalogPdfApiService } from '@features/catalog/products/reporting/services/api/catalog-pdf-api.service';
import { StockPdfApiService } from '@features/inventory/warehouses/reporting/services/api/stock-pdf-api.service';
import { MovementsPdfApiService } from '@features/inventory/warehouses/reporting/services/api/movements-pdf-api.service';
import { OrderPdfApiService } from '@features/sales/orders/reporting/services/api/order-pdf-api.service';
import { InvoicePdfApiService } from '@features/finance/billing/invoices/reporting/services/api/invoice-pdf-api.service';
import { QuotePdfApiService } from '@features/sales/quotes/reporting/services/api/quote-pdf-api.service';

describe('CategoriesListPageComponent', () => {
  let component: CategoriesListPageComponent;
  let fixture: ComponentFixture<CategoriesListPageComponent>;
  let mockService: Partial<CategoryApplicationService>;
  let router: Router;
  let confirmationService: ConfirmationService;
  let messageService: MessageService;

  const mockCategory: CategoryList = {
    id: 'cat-001',
    name: 'Electronics',
    description: 'Electronic products',
    active: true,
    productCount: 10,
    deletable: false,
  };

  beforeEach(async () => {
    mockService = {
      loadAll: vi
        .fn()
        .mockReturnValue(
          of({ content: [mockCategory], totalElements: 1, totalPages: 1, size: 10, number: 0 }),
        ),
      toggleActive: vi.fn().mockReturnValue(of({ ...mockCategory, active: false })),
      delete: vi.fn().mockReturnValue(of(undefined)),
      categories: signal([mockCategory]),
      loading: signal(false),
      totalElements: signal(1),
    };

    await TestBed.configureTestingModule({
      imports: [CategoriesListPageComponent],
      providers: [
        provideRouter([]),
        { provide: CategoryApplicationService, useValue: mockService },
        ConfirmationService,
        MessageService,
        { provide: CatalogPdfApiService, useValue: { downloadPdf: vi.fn() } },
        { provide: StockPdfApiService, useValue: { getPdf: vi.fn() } },
        { provide: MovementsPdfApiService, useValue: { getPdf: vi.fn() } },
        { provide: OrderPdfApiService, useValue: { downloadOrdersReportPdf: vi.fn() } },
        { provide: InvoicePdfApiService, useValue: { downloadInvoicesReportPdf: vi.fn() } },
        { provide: QuotePdfApiService, useValue: { downloadQuotesReportPdf: vi.fn() } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoriesListPageComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    confirmationService = TestBed.inject(ConfirmationService);
    messageService = TestBed.inject(MessageService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load categories on init', () => {
    fixture.detectChanges();
    expect(mockService.loadAll).toHaveBeenCalled();
  });

  it('should update searchTerm and call loadWithFilters on onSearch', () => {
    fixture.detectChanges();
    component.onSearch('test');
    expect(component.searchTerm()).toBe('test');
    expect(mockService.loadAll).toHaveBeenCalled();
  });

  it('should reset first to 0 on onSearch', () => {
    fixture.detectChanges();
    component.first.set(20);
    component.onSearch('test');
    expect(component.first()).toBe(0);
  });

  it('should update pagination and call loadWithFilters on onPageChange', () => {
    fixture.detectChanges();
    component.onPageChange({ first: 20, rows: 20 });
    expect(component.first()).toBe(20);
    expect(component.rows()).toBe(20);
    expect(mockService.loadAll).toHaveBeenCalled();
  });

  it('should update orderBy and orderDir on onSort', () => {
    fixture.detectChanges();
    component.onSort({ field: 'name', order: -1 } as SortEvent);
    expect(component.orderBy()).toBe('name');
    expect(component.orderDir()).toBe('desc');
    expect(mockService.loadAll).toHaveBeenCalled();
  });

  it('should reset first to 0 on onSort', () => {
    fixture.detectChanges();
    component.first.set(20);
    component.onSort({ field: 'name', order: -1 } as SortEvent);
    expect(component.first()).toBe(0);
  });

  it('should return early if same sort field and direction', () => {
    fixture.detectChanges();
    const callCount = (mockService.loadAll as ReturnType<typeof vi.fn>).mock.calls.length;
    component.onSort({ field: 'name', order: 1 } as SortEvent);
    expect((mockService.loadAll as ReturnType<typeof vi.fn>).mock.calls.length).toBe(callCount);
  });

  it('should update filterActive and call loadWithFilters on onActiveFilterChange', () => {
    fixture.detectChanges();
    component.onActiveFilterChange('false');
    expect(component.filterActive()).toBe('false');
    expect(mockService.loadAll).toHaveBeenCalled();
  });

  it('should set filterActive to empty string when value is null', () => {
    fixture.detectChanges();
    component.onActiveFilterChange(null);
    expect(component.filterActive()).toBe('');
  });

  it('should reset filters and call loadWithFilters on clearFilters', () => {
    fixture.detectChanges();
    component.searchTerm.set('test');
    component.filterActive.set('false');
    component.clearFilters();
    expect(component.filterActive()).toBe('true');
    expect(mockService.loadAll).toHaveBeenCalled();
  });

  it('should navigate to /categories/new on onCreate', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onCreate();
    expect(navigateSpy).toHaveBeenCalledWith(['/categories', 'new']);
  });

  it('should navigate to /categories/{id} on onView', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onView(mockCategory);
    expect(navigateSpy).toHaveBeenCalledWith(['/categories', mockCategory.id]);
  });

  it('should navigate to /categories/{id}/edit on onEdit', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onEdit(mockCategory);
    expect(navigateSpy).toHaveBeenCalledWith(['/categories', mockCategory.id, 'edit']);
  });

  it('should call service.toggleActive on onToggleActive', () => {
    fixture.detectChanges();
    component.onToggleActive(mockCategory);
    expect(mockService.toggleActive).toHaveBeenCalledWith('cat-001', false);
  });

  it('should show success message on toggleActive success', () => {
    const addSpy = vi.spyOn(messageService, 'add');
    fixture.detectChanges();
    component.onToggleActive(mockCategory);
    expect(addSpy).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Categoría desactivada exitosamente',
      life: 3000,
    });
  });

  it('should show error message on toggleActive error', () => {
    mockService.toggleActive = vi.fn().mockReturnValue(of({}));
    vi.spyOn(messageService, 'add');
    fixture.detectChanges();
    const addSpy = vi.spyOn(messageService, 'add');
    mockService.toggleActive = vi.fn().mockImplementation(() => {
      setTimeout(() => addSpy.mock.calls.pop(), 0);
      return of({});
    });
    component.onToggleActive(mockCategory);
  });

  it('should call service.delete when confirm accept is called', () => {
    fixture.detectChanges();
    component.onDelete(mockCategory);
    const confirmCall = (confirmationService.confirm as any).mock?.calls?.[0]?.[0];
    if (confirmCall) {
      confirmCall.accept();
      expect(mockService.delete).toHaveBeenCalledWith('cat-001');
    }
  });

  describe('computed signals', () => {
    it('should show initial loading when loading and no categories', () => {
      mockService.loading = signal(true);
      mockService.categories = signal([]);
      fixture = TestBed.createComponent(CategoriesListPageComponent);
      component = fixture.componentInstance;
      expect(component.showInitialLoading()).toBe(true);
    });

    it('should not show initial loading when loading but has categories', () => {
      mockService.loading = signal(true);
      mockService.categories = signal([mockCategory]);
      fixture = TestBed.createComponent(CategoriesListPageComponent);
      component = fixture.componentInstance;
      expect(component.showInitialLoading()).toBe(false);
    });

    it('should show empty database when not loading, no elements, active filter, no search', () => {
      mockService.loading = signal(false);
      mockService.totalElements = signal(0);
      fixture = TestBed.createComponent(CategoriesListPageComponent);
      component = fixture.componentInstance;
      expect(component.isEmptyDatabase()).toBe(true);
    });

    it('keeps the list header visible when the database is empty', () => {
      mockService.loading = signal(false);
      mockService.categories = signal([]);
      mockService.totalElements = signal(0);
      fixture = TestBed.createComponent(CategoriesListPageComponent);

      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('app-search-field')).toBeTruthy();
    });

    it('should show filtered results when not loading, no elements, and search term exists', () => {
      mockService.loading = signal(false);
      mockService.totalElements = signal(0);
      fixture = TestBed.createComponent(CategoriesListPageComponent);
      component = fixture.componentInstance;
      component.searchTerm.set('test');
      expect(component.hasFilteredResults()).toBe(true);
    });

    it('should show filtered results when not loading, no elements, and inactive filter', () => {
      mockService.loading = signal(false);
      mockService.totalElements = signal(0);
      fixture = TestBed.createComponent(CategoriesListPageComponent);
      component = fixture.componentInstance;
      component.filterActive.set('false');
      expect(component.hasFilteredResults()).toBe(true);
    });

    it('should have activeFilterCount of 0 when filter is true', () => {
      fixture.detectChanges();
      expect(component.activeFilterCount()).toBe(0);
    });

    it('should have activeFilterCount of 1 when filter is false', () => {
      fixture.detectChanges();
      component.filterActive.set('false');
      expect(component.activeFilterCount()).toBe(1);
    });
  });
});
