import { ComponentFixture, TestBed, TestBedStatic } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, signal, NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { OrderFormPageComponent } from '@features/sales/orders/pages/order-form-page/order-form-page.component';
import { OrderApplicationService } from '@features/sales/orders/services/application/order-application.service';
import { OrderStatus } from '@features/sales/orders/models/enums/order-status.enum';
import { OrderDetails } from '@features/sales/orders/models/interfaces/order-details.interface';
import { PendingTabsService } from '@core/pending-tabs';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ORDER_SUCCESS_MESSAGES } from '@features/sales/orders/messages/success-messages';

describe('OrderFormPageComponent', () => {
  let component: OrderFormPageComponent;
  let fixture: ComponentFixture<OrderFormPageComponent>;
  let mockService: Partial<OrderApplicationService>;
  let router: Router;
  let messageService: MessageService;
  let httpMock: HttpTestingController;

  const mockOrder: OrderDetails = {
    id: 'ord-001',
    orderNumber: 'ORD-001',
    customerId: 'c1',
    customerAlias: 'Test Customer',
    customerLegalName: 'Test Customer C.A.',
    status: OrderStatus.DRAFT,
    notes: 'Test notes',
    totalAmount: 500,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    items: [
      {
        id: 'line-001',
        productId: 'p1',
        productName: 'Motor 10HP',
        productCode: 'MOT-10',
        quantity: 5,
        unitPrice: 100,
        subtotal: 500,
        warehouseAllocations: [
          {
            warehouseId: 'wh-001',
            warehouseCode: 'WH1',
            warehouseName: 'Central',
            available: 50,
            allocated: 5,
          },
        ],
        warehouseStocks: [
          {
            warehouseId: 'wh-001',
            warehouseCode: 'WH1',
            warehouseName: 'Central',
            quantity: 50,
            reserved: 10,
            available: 40,
          },
        ],
      },
    ],
  };

  const mockPendingTabsService = {
    get: vi.fn().mockReturnValue(null),
    save: vi.fn(),
    remove: vi.fn(),
    tabCount: signal(0),
    allTabs: signal([]),
  };

  function configureTestBed(
    id: string | null = null,
    loadByIdValue: any = of(mockOrder),
    createValue: any = of(mockOrder),
    updateValue: any = of(mockOrder),
  ) {
    mockService = {
      loadById: vi.fn().mockReturnValue(loadByIdValue),
      create: vi.fn().mockReturnValue(createValue),
      update: vi.fn().mockReturnValue(updateValue),
      loadAll: vi.fn().mockReturnValue(of([])),
      orders: signal([]),
      currentOrder: signal(null),
      loading: signal(false),
      error: signal(null),
      totalElements: signal(0),
    };

    const paramMap = { get: (key: string) => (key === 'id' ? id : null) };

    TestBed.configureTestingModule({
      imports: [OrderFormPageComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap, queryParamMap: { get: () => null } },
            paramMap: of({ get: () => id }),
          },
        },
        { provide: OrderApplicationService, useValue: mockService },
        { provide: PendingTabsService, useValue: mockPendingTabsService },
        MessageService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    TestBed.compileComponents();
  }

  function createComponent() {
    fixture = TestBed.createComponent(OrderFormPageComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    messageService = TestBed.inject(MessageService);
    httpMock = TestBed.inject(HttpTestingController);
  }

  beforeEach(() => {
    mockPendingTabsService.get.mockReturnValue(null);
    mockPendingTabsService.save.mockClear();
    mockPendingTabsService.remove.mockClear();
    (TestBed as TestBedStatic).resetTestingModule();
    configureTestBed();
    createComponent();
  });

  afterEach(() => {
    if (httpMock) {
      httpMock.match(() => true).forEach((req) => req.flush([]));
    }
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be in CREATE mode when no id', () => {
    fixture.detectChanges();
    expect(component.isEditMode()).toBe(false);
  });

  it('should be in EDIT mode when id is provided', () => {
    (TestBed as TestBedStatic).resetTestingModule();
    configureTestBed('ord-001');
    createComponent();
    fixture.detectChanges();
    expect(component.isEditMode()).toBe(true);
  });

  it('should have correct form structure', () => {
    fixture.detectChanges();
    expect(component.form.get('customerId')).toBeTruthy();
    expect(component.form.get('notes')).toBeTruthy();
  });

  it('should mark customerId as required', () => {
    fixture.detectChanges();
    const ctrl = component.form.get('customerId');
    ctrl?.setValue('');
    expect(ctrl?.hasError('required')).toBe(true);
  });

  it('should compute total from items', () => {
    fixture.detectChanges();
    component.items.set([
      {
        productId: 'p1',
        productCode: 'MOT-10',
        productName: 'Motor 10HP',
        quantity: 5,
        unitPrice: 100,
        stock: [],
        warehouseAllocations: [],
      },
    ]);
    expect(component.total()).toBe(500);
  });

  it('should compute total from multiple items', () => {
    fixture.detectChanges();
    component.items.set([
      {
        productId: 'p1',
        productCode: 'MOT-10',
        productName: 'Motor 10HP',
        quantity: 5,
        unitPrice: 100,
        stock: [],
        warehouseAllocations: [],
      },
      {
        productId: 'p2',
        productCode: 'MOT-20',
        productName: 'Motor 20HP',
        quantity: 3,
        unitPrice: 200,
        stock: [],
        warehouseAllocations: [],
      },
    ]);
    expect(component.total()).toBe(1100);
  });

  it('should update submit tooltip when form is invalid', () => {
    fixture.detectChanges();
    expect(component.submitTooltip()).toContain('Campos requeridos');
  });

  it('should clear submit tooltip when form is valid', () => {
    fixture.detectChanges();
    component.form.patchValue({ customerId: 'c1' });
    component.onItemsChange([
      {
        productId: 'p1',
        productCode: 'PRD-1',
        productName: 'Product',
        quantity: 1,
        unitPrice: 10,
        stock: [],
        warehouseAllocations: [],
      },
    ]);
    fixture.detectChanges();
    expect(component.submitTooltip()).toBe('');
  });

  describe('customer picker', () => {
    it('should open picker', () => {
      fixture.detectChanges();
      component.openPicker();
      expect(component.pickerVisible()).toBe(true);
    });

    it('should set selected customer on selection', () => {
      fixture.detectChanges();
      component.onCustomerSelected({ id: 'c1', alias: 'Test', legalName: 'Test C.A.' } as any);
      expect(component.selectedCustomer()?.id).toBe('c1');
      expect(component.selectedCustomerLabel()?.alias).toBe('Test');
      expect(component.form.get('customerId')?.value).toBe('c1');
      expect(component.pickerVisible()).toBe(false);
    });

    it('should close picker on cancel', () => {
      fixture.detectChanges();
      component.pickerVisible.set(true);
      component.onPickerCancelled();
      expect(component.pickerVisible()).toBe(false);
    });
  });

  describe('items change', () => {
    it('should update items signal', () => {
      fixture.detectChanges();
      const newItems = [
        {
          productId: 'p1',
          productCode: 'MOT-10',
          productName: 'Motor 10HP',
          quantity: 3,
          unitPrice: 100,
          stock: [],
          warehouseAllocations: [],
        },
      ];
      component.onItemsChange(newItems);
      expect(component.items()).toHaveLength(1);
    });
  });

  describe('submit - CREATE mode', () => {
    it('should call service.create when form is valid', () => {
      fixture.detectChanges();
      component.form.patchValue({ customerId: 'c1' });
      component.items.set([
        {
          productId: 'p1',
          productCode: 'MOT-10',
          productName: 'Motor 10HP',
          quantity: 5,
          unitPrice: 100,
          stock: [],
          warehouseAllocations: [
            {
              warehouseId: 'wh-001',
              warehouseCode: 'WH1',
              warehouseName: 'Central',
              available: 50,
              allocated: 5,
            },
          ],
        },
      ]);

      component.submit();

      expect(mockService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          customerId: 'c1',
        }),
      );
    });

    it('should navigate to order detail on create success', () => {
      fixture.detectChanges();
      component.form.patchValue({ customerId: 'c1' });
      component.items.set([
        {
          productId: 'p1',
          productCode: 'MOT-10',
          productName: 'Motor 10HP',
          quantity: 5,
          unitPrice: 100,
          stock: [],
          warehouseAllocations: [
            {
              warehouseId: 'wh-001',
              warehouseCode: 'WH1',
              warehouseName: 'Central',
              available: 50,
              allocated: 5,
            },
          ],
        },
      ]);

      const navigateSpy = vi.spyOn(router, 'navigate');
      component.submit();

      expect(navigateSpy).toHaveBeenCalledWith(['/sales/orders', 'ord-001']);
    });

    it('should show success message on create success', () => {
      fixture.detectChanges();
      component.form.patchValue({ customerId: 'c1' });
      component.items.set([
        {
          productId: 'p1',
          productCode: 'MOT-10',
          productName: 'Motor 10HP',
          quantity: 5,
          unitPrice: 100,
          stock: [],
          warehouseAllocations: [
            {
              warehouseId: 'wh-001',
              warehouseCode: 'WH1',
              warehouseName: 'Central',
              available: 50,
              allocated: 5,
            },
          ],
        },
      ]);

      const addSpy = vi.spyOn(messageService, 'add');
      component.submit();

      expect(addSpy).toHaveBeenCalledWith(ORDER_SUCCESS_MESSAGES.created);
    });

    it('should show error on create failure', () => {
      (TestBed as TestBedStatic).resetTestingModule();
      configureTestBed(
        null,
        of(mockOrder),
        throwError(() => new Error('Fail')),
      );
      createComponent();
      fixture.detectChanges();
      component.form.patchValue({ customerId: 'c1' });
      component.items.set([
        {
          productId: 'p1',
          productCode: 'MOT-10',
          productName: 'Motor 10HP',
          quantity: 5,
          unitPrice: 100,
          stock: [],
          warehouseAllocations: [
            {
              warehouseId: 'wh-001',
              warehouseCode: 'WH1',
              warehouseName: 'Central',
              available: 50,
              allocated: 5,
            },
          ],
        },
      ]);

      const addSpy = vi.spyOn(messageService, 'add');
      component.submit();

      expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
    });

    it('should not submit when form is invalid', () => {
      fixture.detectChanges();
      component.submit();
      expect(mockService.create).not.toHaveBeenCalled();
    });

    it('should not submit when no items', () => {
      fixture.detectChanges();
      component.form.patchValue({ customerId: 'c1' });
      component.submit();
      expect(mockService.create).not.toHaveBeenCalled();
    });

    it('should show warning when no items', () => {
      fixture.detectChanges();
      component.form.patchValue({ customerId: 'c1' });
      const addSpy = vi.spyOn(messageService, 'add');
      component.submit();
      expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'warn' }));
    });

    it('should not submit when no warehouse allocations', () => {
      fixture.detectChanges();
      component.form.patchValue({ customerId: 'c1' });
      component.items.set([
        {
          productId: 'p1',
          productCode: 'MOT-10',
          productName: 'Motor 10HP',
          quantity: 5,
          unitPrice: 100,
          stock: [],
          warehouseAllocations: [],
        },
      ]);

      const addSpy = vi.spyOn(messageService, 'add');
      component.submit();

      expect(mockService.create).not.toHaveBeenCalled();
      expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'warn' }));
    });
  });

  describe('submit - EDIT mode', () => {
    beforeEach(() => {
      (TestBed as TestBedStatic).resetTestingModule();
      configureTestBed('ord-001');
      createComponent();
      fixture.detectChanges();
    });

    it('should call service.update when form is valid', () => {
      component.form.patchValue({ customerId: 'c1' });
      component.items.set([
        {
          productId: 'p1',
          productCode: 'MOT-10',
          productName: 'Motor 10HP',
          quantity: 5,
          unitPrice: 100,
          stock: [],
          warehouseAllocations: [
            {
              warehouseId: 'wh-001',
              warehouseCode: 'WH1',
              warehouseName: 'Central',
              available: 50,
              allocated: 5,
            },
          ],
        },
      ]);

      component.submit();

      expect(mockService.update).toHaveBeenCalledWith('ord-001', expect.objectContaining({}));
    });

    it('should show success message on update success', () => {
      component.form.patchValue({ customerId: 'c1' });
      component.items.set([
        {
          productId: 'p1',
          productCode: 'MOT-10',
          productName: 'Motor 10HP',
          quantity: 5,
          unitPrice: 100,
          stock: [],
          warehouseAllocations: [
            {
              warehouseId: 'wh-001',
              warehouseCode: 'WH1',
              warehouseName: 'Central',
              available: 50,
              allocated: 5,
            },
          ],
        },
      ]);

      const addSpy = vi.spyOn(messageService, 'add');
      component.submit();

      expect(addSpy).toHaveBeenCalledWith(ORDER_SUCCESS_MESSAGES.updated);
    });

    it('should show error on update failure', () => {
      (TestBed as TestBedStatic).resetTestingModule();
      configureTestBed(
        'ord-001',
        of(mockOrder),
        of(mockOrder),
        throwError(() => new Error('Fail')),
      );
      createComponent();
      fixture.detectChanges();
      component.form.patchValue({ customerId: 'c1' });
      component.items.set([
        {
          productId: 'p1',
          productCode: 'MOT-10',
          productName: 'Motor 10HP',
          quantity: 5,
          unitPrice: 100,
          stock: [],
          warehouseAllocations: [
            {
              warehouseId: 'wh-001',
              warehouseCode: 'WH1',
              warehouseName: 'Central',
              available: 50,
              allocated: 5,
            },
          ],
        },
      ]);

      const addSpy = vi.spyOn(messageService, 'add');
      component.submit();

      expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
    });
  });

  describe('cancel', () => {
    it('should navigate to /pedidos', () => {
      fixture.detectChanges();
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.cancel();
      expect(navigateSpy).toHaveBeenCalledWith(['/sales/orders']);
    });
  });

  describe('loadOrder', () => {
    it('should load order and patch form', () => {
      (TestBed as TestBedStatic).resetTestingModule();
      configureTestBed('ord-001');
      createComponent();
      fixture.detectChanges();

      expect(component.form.get('notes')?.value).toBe('Test notes');
      expect(component.orderNumber()).toBe('ORD-001');
      expect(component.selectedCustomer()?.id).toBe('c1');
    });

    it('should populate items from loaded order', () => {
      (TestBed as TestBedStatic).resetTestingModule();
      configureTestBed('ord-001');
      createComponent();
      fixture.detectChanges();

      expect(component.items()).toHaveLength(1);
      expect(component.items()[0].productId).toBe('p1');
    });
  });

  describe('computed signals', () => {
    it('should compute selectedCustomerId from selectedCustomer', () => {
      fixture.detectChanges();
      component.selectedCustomer.set({ id: 'c1' } as any);
      expect(component.selectedCustomerId()).toBe('c1');
    });

    it('should return null selectedCustomerId when no customer', () => {
      fixture.detectChanges();
      component.selectedCustomer.set(null);
      expect(component.selectedCustomerId()).toBeNull();
    });
  });
});
