import { provideRouter } from '@angular/router';
import { AuthorizationService } from '@features/platform/auth/authorization/services/authorization.service';
import { ComponentFixture, TestBed, TestBedStatic } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ActivatedRoute, Router } from '@angular/router';
import { signal, NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { InvoiceDetailPageComponent } from '@features/finance/billing/invoices/pages/invoice-detail-page/invoice-detail-page.component';
import { InvoiceApplicationService } from '@features/finance/billing/invoices/services/application/invoice-application.service';
import { InvoiceStatus } from '@features/finance/billing/invoices/models/enums/invoice-status.enum';
import { PaymentType } from '@features/finance/billing/invoices/models/enums/payment-type.enum';
import { NoteInfo } from '@features/finance/billing/invoices/models/interfaces/invoice-details.interface';

describe('InvoiceDetailPageComponent', () => {
  let component: InvoiceDetailPageComponent;
  let fixture: ComponentFixture<InvoiceDetailPageComponent>;
  let mockService: Partial<InvoiceApplicationService>;
  let router: Router;
  let messageService: MessageService;

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
    creditApplied: 0,
    debitApplied: 0,
    total: 500,
    notesList: [],
    returns: [],
    cancelledAt: null,
    cancelledReason: null,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    lines: [],
  };

  beforeEach(() => {
    mockService = {
      loadById: vi.fn().mockReturnValue(of(mockInvoice)),
      currentInvoice: signal(mockInvoice),
      loading: signal(false),
      duplicate: vi.fn().mockReturnValue(of(mockInvoice)),
    };

    (TestBed as TestBedStatic).resetTestingModule();
    TestBed.configureTestingModule({
      imports: [InvoiceDetailPageComponent],
      providers: [
        provideRouter([]),
        { provide: AuthorizationService, useValue: { can: () => true } },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'inv-001' } } } },
        { provide: InvoiceApplicationService, useValue: mockService },
        MessageService,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(InvoiceDetailPageComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    messageService = TestBed.inject(MessageService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load invoice on init', () => {
    fixture.detectChanges();
    expect(mockService.loadById).toHaveBeenCalledWith('inv-001');
  });

  it('should navigate back to /facturas', () => {
    fixture.detectChanges();
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onBack();
    expect(navigateSpy).toHaveBeenCalledWith(['/finance/billing/invoices']);
  });

  it('should navigate to edit route', () => {
    fixture.detectChanges();
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onEdit();
    expect(navigateSpy).toHaveBeenCalledWith(['/finance/billing/invoices', 'inv-001', 'edit']);
  });

  it('should open duplicate dialog', () => {
    fixture.detectChanges();
    component.onDuplicate();
    expect(component.duplicateDialogVisible()).toBe(true);
  });

  it('should call duplicate service on dialog confirmed', () => {
    fixture.detectChanges();
    component.onDuplicateDialogConfirmed({ invoiceId: 'inv-001' });
    expect(mockService.duplicate).toHaveBeenCalledWith('inv-001', undefined);
  });

  it('should navigate to /facturas on duplicate success', () => {
    fixture.detectChanges();
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onDuplicateDialogConfirmed({ invoiceId: 'inv-001' });
    expect(navigateSpy).toHaveBeenCalledWith(['/finance/billing/invoices']);
  });

  it('should close duplicate dialog on dismissed', () => {
    fixture.detectChanges();
    component.duplicateDialogVisible.set(true);
    component.onDuplicateDialogDismissed();
    expect(component.duplicateDialogVisible()).toBe(false);
  });

  it('should get status label', () => {
    fixture.detectChanges();
    expect(component.getStatusLabel(InvoiceStatus.DRAFT)).toBe('Borrador');
    expect(component.getStatusLabel(InvoiceStatus.PAID)).toBe('Pagada');
  });

  it('should get status variant', () => {
    fixture.detectChanges();
    expect(component.getStatusVariant(InvoiceStatus.DRAFT)).toBe('label');
    expect(component.getStatusVariant(InvoiceStatus.PAID)).toBe('success');
    expect(component.getStatusVariant(InvoiceStatus.CANCELLED)).toBe('danger');
    expect(component.getStatusVariant(InvoiceStatus.PENDING_PAYMENT)).toBe('info');
  });

  it('should get payment type label', () => {
    fixture.detectChanges();
    expect(component.getPaymentTypeLabel(PaymentType.CASH)).toBe('Contado');
    expect(component.getPaymentTypeLabel(PaymentType.CREDIT)).toBe('Crédito');
  });
});
