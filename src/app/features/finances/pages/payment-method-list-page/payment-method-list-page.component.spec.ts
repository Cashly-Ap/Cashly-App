import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Router, provideRouter } from '@angular/router';
import { signal, NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { ConfirmationService, MessageService, SortEvent } from 'primeng/api';
import { PaymentMethodListPageComponent } from './payment-method-list-page.component';
import { FinanceApplicationService } from '@features/finances/services/application';
import { PaymentMethodList } from '@features/finances/models/interfaces';

describe('PaymentMethodListPageComponent', () => {
  let component: PaymentMethodListPageComponent;
  let fixture: ComponentFixture<PaymentMethodListPageComponent>;
  let mockService: Partial<FinanceApplicationService>;
  let router: Router;
  let confirmationService: ConfirmationService;
  let messageService: MessageService;

  const mockPaymentMethod: PaymentMethodList = {
    id: 'pm-001',
    code: 'CASH',
    name: 'Efectivo',
    description: null,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
  };

  beforeEach(async () => {
    mockService = {
      loadPaymentMethods: vi.fn().mockReturnValue(of({ content: [mockPaymentMethod], totalElements: 1, totalPages: 1, size: 10, number: 0 })),
      togglePaymentMethod: vi.fn().mockReturnValue(of({ ...mockPaymentMethod, isActive: false })),
      paymentMethods: signal([mockPaymentMethod]),
      loading: signal(false),
      totalElements: signal(1),
    };

    await TestBed.configureTestingModule({
      imports: [PaymentMethodListPageComponent],
      providers: [
        provideRouter([]),
        { provide: FinanceApplicationService, useValue: mockService },
        ConfirmationService,
        MessageService,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentMethodListPageComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    confirmationService = TestBed.inject(ConfirmationService);
    messageService = TestBed.inject(MessageService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load payment methods on init', () => {
    fixture.detectChanges();
    expect(mockService.loadPaymentMethods).toHaveBeenCalled();
  });

  it('should update searchTerm and call loadWithFilters on onSearch', () => {
    fixture.detectChanges();
    component.onSearch('test');
    expect(component.searchTerm()).toBe('test');
    expect(mockService.loadPaymentMethods).toHaveBeenCalled();
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
    expect(mockService.loadPaymentMethods).toHaveBeenCalled();
  });

  it('should update orderBy and orderDir on onSort', () => {
    fixture.detectChanges();
    component.onSort({ field: 'name', order: -1 } as SortEvent);
    expect(component.orderBy()).toBe('name');
    expect(component.orderDir()).toBe('desc');
    expect(mockService.loadPaymentMethods).toHaveBeenCalled();
  });

  it('should update filterActive and call loadWithFilters on onActiveFilterChange', () => {
    fixture.detectChanges();
    component.onActiveFilterChange('false');
    expect(component.filterActive()).toBe('false');
    expect(mockService.loadPaymentMethods).toHaveBeenCalled();
  });

  it('should reset filters and call loadWithFilters on clearFilters', () => {
    fixture.detectChanges();
    component.searchTerm.set('test');
    component.filterActive.set('false');
    component.clearFilters();
    expect(component.filterActive()).toBe('true');
    expect(mockService.loadPaymentMethods).toHaveBeenCalled();
  });

  it('should navigate to /finances/nuevo on onCreate', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onCreate();
    expect(navigateSpy).toHaveBeenCalledWith(['/finances', 'nuevo']);
  });

  it('should navigate to /finances/{id}/editar on onEdit', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onEdit(mockPaymentMethod);
    expect(navigateSpy).toHaveBeenCalledWith(['/finances', mockPaymentMethod.id, 'editar']);
  });

  it('should call service.togglePaymentMethod on onToggleActive', () => {
    fixture.detectChanges();
    component.onToggleActive(mockPaymentMethod);
    expect(mockService.togglePaymentMethod).toHaveBeenCalledWith('pm-001');
  });

  it('should show success message on togglePaymentMethod success', () => {
    const addSpy = vi.spyOn(messageService, 'add');
    fixture.detectChanges();
    component.onToggleActive(mockPaymentMethod);
    expect(addSpy).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Método de pago desactivado exitosamente',
      life: 3000,
    });
  });

  describe('computed signals', () => {
    it('should show initial loading when loading and no payment methods', () => {
      mockService.loading = signal(true);
      mockService.paymentMethods = signal([]);
      fixture = TestBed.createComponent(PaymentMethodListPageComponent);
      component = fixture.componentInstance;
      expect(component.showInitialLoading()).toBe(true);
    });

    it('should show empty database when not loading, no elements, active filter, no search', () => {
      mockService.loading = signal(false);
      mockService.totalElements = signal(0);
      fixture = TestBed.createComponent(PaymentMethodListPageComponent);
      component = fixture.componentInstance;
      expect(component.isEmptyDatabase()).toBe(true);
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
