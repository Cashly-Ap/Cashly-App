import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MessageService } from 'primeng/api';
import { AuthorizationService } from '@features/platform/auth/authorization/services/authorization.service';
import { ReceivablesApiService } from '@features/finance/treasury/receivables/services/api/receivables-api.service';
import { PendingPayment } from '@features/finance/treasury/receivables/models/interfaces/pending-payment.interface';
import { PendingPaymentRejectDialogComponent } from './pending-payment-reject-dialog.component';

const payment: PendingPayment = {
  id: 'payment-1',
  paymentNumber: 'PAY-001',
  customerId: 'customer-1',
  customerName: 'Cliente',
  amount: 125,
  paymentMethodName: 'Transferencia',
  status: 'PENDING',
  source: 'PAYMENT_METHOD',
  paymentDate: '2026-08-11',
  createdAt: '2026-08-11T12:00:00',
  invoiceNumber: 'FAC-001',
  voucherUrl: null,
};

describe('PendingPaymentRejectDialogComponent', () => {
  let fixture: ComponentFixture<PendingPaymentRejectDialogComponent>;
  let component: PendingPaymentRejectDialogComponent;
  let api: { approvePayment: ReturnType<typeof vi.fn>; rejectPayment: ReturnType<typeof vi.fn> };
  let messages: { add: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    TestBed.resetTestingModule();
    vi.clearAllMocks();
    api = {
      approvePayment: vi.fn(() => of({})),
      rejectPayment: vi.fn(() => of({})),
    };
    messages = { add: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [PendingPaymentRejectDialogComponent],
      providers: [
        provideRouter([]),
        { provide: AuthorizationService, useValue: { can: () => true } },
        { provide: ReceivablesApiService, useValue: api },
        { provide: MessageService, useValue: messages },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PendingPaymentRejectDialogComponent);
    component = fixture.componentInstance;
  });

  it('clears the reason every time the dialog opens', () => {
    component.reason.set('Motivo anterior');

    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();

    expect(component.reason()).toBe('');
  });

  it('rejects the payment with the trimmed reason and notifies completion', () => {
    const completed = vi.fn();
    component.completed.subscribe(completed);
    fixture.componentRef.setInput('payment', payment);
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();
    component.reason.set('  Referencia inválida  ');

    component.submit();

    expect(api.rejectPayment).toHaveBeenCalledWith('payment-1', 'Referencia inválida');
    expect(completed).toHaveBeenCalledTimes(1);
    expect(component.visible()).toBe(false);
    expect(messages.add).toHaveBeenCalledWith({
      severity: 'warn',
      summary: 'Pago rechazado',
      detail: 'El pago ha sido rechazado.',
    });
  });

  it('does not submit without a payment or a reason', () => {
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();
    component.reason.set('Motivo');

    component.submit();

    expect(api.rejectPayment).not.toHaveBeenCalled();
  });

  it('informs the failure without closing the dialog', () => {
    api.rejectPayment.mockReturnValue(throwError(() => new Error('boom')));
    fixture.componentRef.setInput('payment', payment);
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();
    component.reason.set('Motivo');

    component.submit();

    expect(messages.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo rechazar el pago.',
    });
    expect(component.visible()).toBe(true);
  });
});
