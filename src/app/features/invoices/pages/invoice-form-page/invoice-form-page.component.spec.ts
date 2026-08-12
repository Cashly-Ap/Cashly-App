import { ComponentFixture, TestBed, TestBedStatic } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ActivatedRoute, Router } from '@angular/router';
import { signal, NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { InvoiceFormPageComponent } from './invoice-form-page.component';
import { InvoiceApplicationService } from '@features/invoices/services/application/invoice-application.service';
import { PaymentType } from '@features/invoices/models/enums/payment-type.enum';
import { InvoiceStatus } from '@features/invoices/models/enums/invoice-status.enum';
import { PendingTabsService } from '@core/pending-tabs';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

describe('InvoiceFormPageComponent', () => {
  let component: InvoiceFormPageComponent;
  let fixture: ComponentFixture<InvoiceFormPageComponent>;
  let mockService: Partial<InvoiceApplicationService>;
  let router: Router;
  let messageService: MessageService;
  let httpMock: HttpTestingController;

  const mockInvoice = {
    id: 'inv-001',
    invoiceNumber: 'FAC-001',
    customerId: 'c1',
    customerName: 'Test Customer',
    customerRif: 'J-12345678-9',
    createdBy: 'user-001',
    createdByName: 'John Doe',
    orderId: null,
    orderNumber: null,
    status: InvoiceStatus.DRAFT,
    paymentType: PaymentType.CASH,
    notes: 'Test notes',
    subtotal: 500,
    cancelledAt: null,
    cancelledReason: null,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    lines: [
      {
        id: 'line-001',
        productId: 'p1',
        productName: 'Motor 10HP',
        productCode: 'MOT-10',
        quantity: 5,
        unitPrice: 100,
        lineTotal: 500,
        warehouseAllocations: [
          {
            id: 'alloc-001',
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
    loadByIdValue: any = of(mockInvoice),
    createValue: any = of(mockInvoice),
    updateValue: any = of(mockInvoice),
  ) {
    mockService = {
      loadById: vi.fn().mockReturnValue(loadByIdValue),
      create: vi.fn().mockReturnValue(createValue),
      update: vi.fn().mockReturnValue(updateValue),
      loadAll: vi.fn().mockReturnValue(of([])),
      invoices: signal([]),
      currentInvoice: signal(null),
      loading: signal(false),
      error: signal(null),
      totalElements: signal(0),
    };

    const paramMap = { get: (key: string) => (key === 'id' ? id : null) };

    TestBed.configureTestingModule({
      imports: [InvoiceFormPageComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap, queryParamMap: { get: () => null } },
            paramMap: of({ get: () => id }),
          },
        },
        { provide: InvoiceApplicationService, useValue: mockService },
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
    fixture = TestBed.createComponent(InvoiceFormPageComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    messageService = fixture.debugElement.injector.get(MessageService);
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
    configureTestBed('inv-001');
    createComponent();
    fixture.detectChanges();
    expect(component.isEditMode()).toBe(true);
  });

  it('should have correct form structure', () => {
    fixture.detectChanges();
    expect(component.form.get('customerId')).toBeTruthy();
    expect(component.form.get('paymentType')).toBeTruthy();
    expect(component.form.get('notes')).toBeTruthy();
  });

  it('should mark customerId as required', () => {
    fixture.detectChanges();
    const ctrl = component.form.get('customerId');
    ctrl?.setValue('');
    expect(ctrl?.hasError('required')).toBe(true);
  });

  it('should mark paymentType as required', () => {
    fixture.detectChanges();
    const ctrl = component.form.get('paymentType');
    ctrl?.setValue('');
    expect(ctrl?.hasError('required')).toBe(true);
  });

  it('should have default paymentType as CASH', () => {
    fixture.detectChanges();
    expect(component.form.get('paymentType')?.value).toBe(PaymentType.CASH);
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

  it('should update submit tooltip when form is invalid', () => {
    fixture.detectChanges();
    expect(component.submitTooltip()).toContain('Campos requeridos');
  });

  it('should clear submit tooltip when form is valid', () => {
    fixture.detectChanges();
    component.form.patchValue({ customerId: 'c1' });
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
      component.form.patchValue({ customerId: 'c1', paymentType: PaymentType.CASH });
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
          paymentType: PaymentType.CASH,
        }),
      );
    });

    it('should navigate to invoice detail on create success', () => {
      fixture.detectChanges();
      component.form.patchValue({ customerId: 'c1', paymentType: PaymentType.CASH });
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

      expect(navigateSpy).toHaveBeenCalledWith(['/invoices', 'inv-001']);
    });

    it('should show error on create failure', () => {
      (TestBed as TestBedStatic).resetTestingModule();
      configureTestBed(
        null,
        of(mockInvoice),
        throwError(() => new Error('Fail')),
      );
      createComponent();
      fixture.detectChanges();
      component.form.patchValue({ customerId: 'c1', paymentType: PaymentType.CASH });
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
      component.form.patchValue({ customerId: 'c1', paymentType: PaymentType.CASH });
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
      configureTestBed('inv-001');
      createComponent();
      fixture.detectChanges();
    });

    it('should call service.update when form is valid', () => {
      component.form.patchValue({ customerId: 'c1', paymentType: PaymentType.CREDIT });
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

      expect(mockService.update).toHaveBeenCalledWith(
        'inv-001',
        expect.objectContaining({
          paymentType: PaymentType.CREDIT,
        }),
      );
    });

    it('should show error on update failure', () => {
      (TestBed as TestBedStatic).resetTestingModule();
      configureTestBed(
        'inv-001',
        of(mockInvoice),
        of(mockInvoice),
        throwError(() => new Error('Fail')),
      );
      createComponent();
      fixture.detectChanges();
      component.form.patchValue({ customerId: 'c1', paymentType: PaymentType.CASH });
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
    it('should navigate to /facturas', () => {
      fixture.detectChanges();
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.cancel();
      expect(navigateSpy).toHaveBeenCalledWith(['/invoices']);
    });
  });

  describe('loadInvoice', () => {
    it('should load invoice and patch form', () => {
      (TestBed as TestBedStatic).resetTestingModule();
      configureTestBed('inv-001');
      createComponent();
      fixture.detectChanges();

      expect(component.form.get('notes')?.value).toBe('Test notes');
      expect(component.form.get('paymentType')?.value).toBe(PaymentType.CASH);
      expect(component.invoiceNumber()).toBe('FAC-001');
    });

    it('should navigate to /facturas on load failure', async () => {
      (TestBed as TestBedStatic).resetTestingModule();
      configureTestBed(
        'inv-999',
        throwError(() => new Error('Not found')),
      );
      createComponent();

      const navigateSpy = vi.spyOn(router, 'navigate');
      fixture.detectChanges();
      await fixture.whenStable();

      httpMock.match(() => true).forEach((req) => req.flush([]));

      expect(navigateSpy).toHaveBeenCalledWith(['/invoices']);
    });
  });
});
