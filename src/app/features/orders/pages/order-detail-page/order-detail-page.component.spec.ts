import { ComponentFixture, TestBed, TestBedStatic } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, signal, NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { OrderDetailPageComponent } from '@features/orders/pages/order-detail-page/order-detail-page.component';
import { OrderApplicationService } from '@features/orders/services/application/order-application.service';
import { OrderStatus } from '@features/orders/models/enums/order-status.enum';
import { OrderDetails } from '@features/orders/models/interfaces';

describe('OrderDetailPageComponent', () => {
  let component: OrderDetailPageComponent;
  let fixture: ComponentFixture<OrderDetailPageComponent>;
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

  beforeEach(() => {
    mockService = {
      loadById: vi.fn().mockReturnValue(of(mockOrder)),
      currentOrder: signal(mockOrder),
      loading: signal(false),
      orders: signal([]),
      totalElements: signal(0),
    };

    (TestBed as TestBedStatic).resetTestingModule();
    TestBed.configureTestingModule({
      imports: [OrderDetailPageComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'ord-001' } } } },
        { provide: OrderApplicationService, useValue: mockService },
        MessageService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(OrderDetailPageComponent);
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

  it('should load order on init', () => {
    fixture.detectChanges();
    expect(mockService.loadById).toHaveBeenCalledWith('ord-001');
  });

  it('should navigate back to /pedidos', () => {
    fixture.detectChanges();
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onBack();
    expect(navigateSpy).toHaveBeenCalledWith(['/orders']);
  });

  it('should navigate to edit route', () => {
    fixture.detectChanges();
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onEdit();
    expect(navigateSpy).toHaveBeenCalledWith(['/orders', 'ord-001', 'edit']);
  });

  it('should get status label', () => {
    fixture.detectChanges();
    expect(component.getStatusLabel(OrderStatus.DRAFT)).toBe('Borrador');
    expect(component.getStatusLabel(OrderStatus.CONFIRMED)).toBe('Confirmado');
    expect(component.getStatusLabel(OrderStatus.CANCELLED)).toBe('Cancelado');
    expect(component.getStatusLabel(OrderStatus.INVOICED)).toBe('Facturado');
  });

  it('should get status variant', () => {
    fixture.detectChanges();
    expect(component.getStatusVariant(OrderStatus.DRAFT)).toBe('label');
    expect(component.getStatusVariant(OrderStatus.CONFIRMED)).toBe('info');
    expect(component.getStatusVariant(OrderStatus.CANCELLED)).toBe('danger');
    expect(component.getStatusVariant(OrderStatus.INVOICED)).toBe('success');
  });

  it('should expose OrderStatus enum', () => {
    fixture.detectChanges();
    expect(component.OrderStatus).toBe(OrderStatus);
    expect(component.OrderStatus.DRAFT).toBe('DRAFT');
    expect(component.OrderStatus.CONFIRMED).toBe('CONFIRMED');
  });
});
