import { ComponentFixture, TestBed, TestBedStatic } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ActivatedRoute, Router } from '@angular/router';
import { signal, NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { QuoteDetailPageComponent } from '@features/quotes/pages/quote-detail-page/quote-detail-page.component';
import { QuoteApplicationService } from '@features/quotes/services/application/quote-application.service';
import { QuoteStatus } from '@features/quotes/models/enums/quote-status.enum';
import { QuoteDetails } from '@features/quotes/models/interfaces';

describe('QuoteDetailPageComponent', () => {
  let component: QuoteDetailPageComponent;
  let fixture: ComponentFixture<QuoteDetailPageComponent>;
  let mockService: Partial<QuoteApplicationService>;
  let router: Router;
  let messageService: MessageService;
  let httpMock: HttpTestingController;

  const mockQuote: QuoteDetails = {
    id: 'q-001',
    quoteNumber: 'QT-001',
    customerId: 'c1',
    customerName: 'Test Customer',
    customerRif: 'J-12345678-9',
    createdBy: 'u1',
    createdByName: 'Admin',
    status: QuoteStatus.DRAFT,
    notes: 'Test notes',
    subtotal: 500,
    lines: [
      {
        id: 'line-001',
        productId: 'p1',
        productName: 'Motor 10HP',
        productCode: 'MOT-10',
        quantity: 5,
        unitPrice: 100,
        subtotal: 500,
        allocations: [
          {
            warehouseId: 'wh-001',
            warehouseCode: 'WH1',
            warehouseName: 'Central',
            allocatedQuantity: 5,
          },
        ],
        warehouseStocks: [{ warehouseId: 'wh-001', warehouseName: 'Central', available: 50 }],
      },
    ],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  };

  beforeEach(() => {
    mockService = {
      loadById: vi.fn().mockReturnValue(of(mockQuote)),
      currentQuote: signal(mockQuote),
      loading: signal(false),
      quotes: signal([]),
      totalElements: signal(0),
    };

    (TestBed as TestBedStatic).resetTestingModule();
    TestBed.configureTestingModule({
      imports: [QuoteDetailPageComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'q-001' } } } },
        { provide: QuoteApplicationService, useValue: mockService },
        MessageService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(QuoteDetailPageComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    messageService = TestBed.inject(MessageService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    if (httpMock) {
      httpMock.match(() => true).forEach((req) => req.flush([]));
    }
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load quote on init', () => {
    fixture.detectChanges();
    expect(mockService.loadById).toHaveBeenCalledWith('q-001');
  });

  it('should navigate back to /presupuestos', () => {
    fixture.detectChanges();
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onBack();
    expect(navigateSpy).toHaveBeenCalledWith(['/quotes']);
  });

  it('should navigate to edit route', () => {
    fixture.detectChanges();
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onEdit();
    expect(navigateSpy).toHaveBeenCalledWith(['/quotes', 'q-001', 'edit']);
  });

  it('should get status label', () => {
    fixture.detectChanges();
    expect(component.getStatusLabel(QuoteStatus.DRAFT)).toBe('Borrador');
    expect(component.getStatusLabel(QuoteStatus.CONVERTED_TO_ORDER)).toBe('Convertido a Pedido');
    expect(component.getStatusLabel(QuoteStatus.CONVERTED_TO_INVOICE)).toBe('Convertido a Factura');
    expect(component.getStatusLabel(QuoteStatus.CANCELLED)).toBe('Cancelado');
  });

  it('should get status variant', () => {
    fixture.detectChanges();
    expect(component.getStatusVariant(QuoteStatus.DRAFT)).toBe('label');
    expect(component.getStatusVariant(QuoteStatus.CONVERTED_TO_ORDER)).toBe('success');
    expect(component.getStatusVariant(QuoteStatus.CONVERTED_TO_INVOICE)).toBe('success');
    expect(component.getStatusVariant(QuoteStatus.CANCELLED)).toBe('danger');
  });

  it('should not render the warehouse reassignment modal', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-assign-warehouses-dialog')).toBeNull();
  });

  it('should expose QuoteStatus enum', () => {
    fixture.detectChanges();
    expect(component.QuoteStatus).toBe(QuoteStatus);
    expect(component.QuoteStatus.DRAFT).toBe('DRAFT');
    expect(component.QuoteStatus.CONVERTED_TO_ORDER).toBe('CONVERTED_TO_ORDER');
  });

  it('should handle error on load failure', () => {
    (mockService.loadById as ReturnType<typeof vi.fn>).mockReturnValue(
      throwError(() => new Error('Not found')),
    );
    (mockService.currentQuote as ReturnType<typeof signal>).set(null);

    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
