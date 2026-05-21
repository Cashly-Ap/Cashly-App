import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReturnFormPageComponent } from './return-form-page.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MessageService } from 'primeng/api';
import { FinanceApplicationService } from '@features/finances/services/application/finance-application.service';
import { InvoiceApiService } from '@features/invoices/services/api/invoice-api.service';

describe('ReturnFormPageComponent', () => {
  let component: ReturnFormPageComponent;
  let fixture: ComponentFixture<ReturnFormPageComponent>;

  const mockFinanceService = {
    loading: { subscribe: () => ({}) },
    createReturn: jasmine.createSpy('createReturn'),
  };

  const mockInvoiceApi = {
    getAll: jasmine.createSpy('getAll'),
    getById: jasmine.createSpy('getById'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReturnFormPageComponent, RouterTestingModule],
      providers: [
        MessageService,
        { provide: FinanceApplicationService, useValue: mockFinanceService },
        { provide: InvoiceApiService, useValue: mockInvoiceApi },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReturnFormPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.returnType()).toBe('MANUAL');
    expect(component.selectedWarehouseId()).toBe('');
  });

  it('should have return type options', () => {
    expect(component.returnTypeOptions.length).toBe(2);
  });

  it('should calculate total amount', () => {
    component.returnLines.set([
      { invoiceLineId: '1', productId: 'p1', productName: 'Test', quantity: 2, warehouseId: 'w1', unitPrice: 50 },
    ]);
    expect(component.totalAmount()).toBe(100);
  });

  it('should reset lines when invoice selected for manual type', () => {
    component.returnType.set('MANUAL');
    component.onInvoiceSelected({
      id: 'inv-1',
      invoiceNumber: 'INV-001',
      customerId: 'cust-1',
      customerName: 'Test',
      customerRif: 'J-123',
      createdBy: 'user-1',
      createdByName: 'User',
      status: 'DRAFT',
      paymentType: 'CASH',
      notes: null,
      subtotal: 100,
      cancelledAt: null,
      cancelledReason: null,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      lines: [
        {
          id: 'line-1',
          productId: 'p1',
          productName: 'Product A',
          productCode: 'P001',
          quantity: 5,
          unitPrice: 20,
          lineTotal: 100,
          warehouseAllocations: [],
          warehouseStocks: [],
        },
      ],
    } as any);
    expect(component.returnLines().length).toBe(1);
    expect(component.returnLines()[0].quantity).toBe(0);
  });
});
