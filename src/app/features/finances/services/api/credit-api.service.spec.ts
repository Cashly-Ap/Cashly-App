import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CreditApiService } from './credit-api.service';

describe('CreditApiService', () => {
  let service: CreditApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CreditApiService],
    });
    service = TestBed.inject(CreditApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCreditStatus', () => {
    it('should return credit status for customer', () => {
      const mockResponse = {
        customerId: 'cust-1',
        customerName: 'Test Customer',
        customerRif: 'J-12345678-9',
        creditLimit: 10000,
        pendingBalance: 3000,
        unconsumedAdvances: 500,
        availableCredit: 6500,
        overdueInvoices: [],
        advances: [],
        hasOverdue: false,
        canCreateCreditInvoice: true,
      };

      service.getCreditStatus('cust-1').subscribe((status) => {
        expect(status.customerId).toBe('cust-1');
        expect(status.availableCredit).toBe(6500);
      });

      const req = httpMock.expectOne('/api/finances/credit/status/cust-1');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getOverdueInvoices', () => {
    it('should return overdue invoices', () => {
      const mockResponse = [
        {
          invoiceNumber: 'INV-001',
          amount: 1500,
          dueDate: '2025-01-15',
          daysOverdue: 30,
        },
      ];

      service.getOverdueInvoices().subscribe((invoices) => {
        expect(invoices.length).toBe(1);
        expect(invoices[0].invoiceNumber).toBe('INV-001');
      });

      const req = httpMock.expectOne('/api/finances/credit/overdue');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getCustomerBalances', () => {
    it('should return customer balances', () => {
      const mockResponse = [
        {
          customerId: 'cust-1',
          customerName: 'Test Customer',
          pendingBalance: 3000,
          availableCredit: 7000,
        },
      ];

      service.getCustomerBalances().subscribe((balances) => {
        expect(balances.length).toBe(1);
        expect(balances[0].customerName).toBe('Test Customer');
      });

      const req = httpMock.expectOne('/api/finances/credit/balances');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });
});
