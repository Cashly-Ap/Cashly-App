import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReturnApiService, ReturnFilters } from './return-api.service';
import { ReturnType } from '../../models/enums/return-type.enum';

describe('ReturnApiService', () => {
  let service: ReturnApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ReturnApiService],
    });
    service = TestBed.inject(ReturnApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('should return returns without filters', () => {
      const mockReturns = [
        {
          id: '1',
          returnNumber: 'RET-001',
          invoiceNumber: 'INV-001',
          customerName: 'Test Customer',
          returnType: ReturnType.MANUAL,
          reason: 'Defective product',
          createdAt: '2024-01-01',
        },
      ];

      service.getAll().subscribe((returns) => {
        expect(returns.length).toBe(1);
        expect(returns[0].returnNumber).toBe('RET-001');
      });

      httpMock.expectOne('/api/finances/returns').flush(mockReturns);
    });

    it('should return returns with filters', () => {
      const filters: ReturnFilters = { customerId: 'cust-1', returnType: ReturnType.AUTOMATIC };

      service.getAll(filters).subscribe();

      const req = httpMock.expectOne((request) =>
        request.url === '/api/finances/returns' &&
        request.params.get('customerId') === 'cust-1' &&
        request.params.get('returnType') === 'AUTOMATIC'
      );
      req.flush([]);
    });
  });

  describe('getById', () => {
    it('should return a return detail', () => {
      const mockDetail = {
        id: '1',
        returnNumber: 'RET-001',
        invoiceId: 'inv-1',
        invoiceNumber: 'INV-001',
        customerId: 'cust-1',
        customerName: 'Test Customer',
        customerRif: 'J-12345678-9',
        returnType: ReturnType.MANUAL,
        reason: 'Defective',
        status: 'PENDING',
        totalAmount: 100,
        createdBy: 'user-1',
        createdByName: 'Test User',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        lines: [
          {
            id: 'line-1',
            invoiceLineId: 'inv-line-1',
            productId: 'prod-1',
            productName: 'Product A',
            quantity: 2,
            warehouseId: 'wh-1',
            warehouseName: 'Main Warehouse',
            unitPrice: 50,
            lineTotal: 100,
          },
        ],
      };

      service.getById('1').subscribe((detail) => {
        expect(detail.id).toBe('1');
        expect(detail.lines.length).toBe(1);
      });

      httpMock.expectOne('/api/finances/returns/1').flush(mockDetail);
    });
  });

  describe('create', () => {
    it('should create a return', () => {
      const createData = {
        invoiceId: 'inv-1',
        customerId: 'cust-1',
        returnType: ReturnType.MANUAL,
        reason: 'Test reason',
        lines: [
          {
            invoiceLineId: 'inv-line-1',
            productId: 'prod-1',
            quantity: 1,
            warehouseId: 'wh-1',
            unitPrice: 50,
          },
        ],
      };

      service.create(createData).subscribe();

      const req = httpMock.expectOne('/api/finances/returns');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createData);
      req.flush({
        id: '1',
        returnNumber: 'RET-001',
        invoiceId: 'inv-1',
        invoiceNumber: 'INV-001',
        customerId: 'cust-1',
        customerName: 'Test Customer',
        customerRif: 'J-12345678-9',
        returnType: ReturnType.MANUAL,
        reason: 'Test reason',
        status: 'PENDING',
        totalAmount: 50,
        createdBy: 'user-1',
        createdByName: 'Test User',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        lines: [],
      });
    });
  });

  describe('cancel', () => {
    it('should cancel a return', () => {
      service.cancel('1').subscribe();

      const req = httpMock.expectOne('/api/finances/returns/1/cancel');
      expect(req.request.method).toBe('PUT');
      req.flush({
        id: '1',
        returnNumber: 'RET-001',
        invoiceId: 'inv-1',
        invoiceNumber: 'INV-001',
        customerId: 'cust-1',
        customerName: 'Test Customer',
        customerRif: 'J-12345678-9',
        returnType: ReturnType.MANUAL,
        reason: 'Test',
        status: 'CANCELLED',
        totalAmount: 50,
        createdBy: 'user-1',
        createdByName: 'Test User',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        lines: [],
      });
    });
  });
});
