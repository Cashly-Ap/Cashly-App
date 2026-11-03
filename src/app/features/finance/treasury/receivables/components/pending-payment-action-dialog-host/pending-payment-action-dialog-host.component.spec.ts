import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MessageService } from 'primeng/api';
import { PendingPaymentActionDialogService } from '@core/layouts/services/pending-payment-action-dialog.service';
import { ReceivablesApiService } from '@features/finance/treasury/receivables/services/api/receivables-api.service';
import { ReceivablesApplicationService } from '@features/finance/treasury/receivables/services/application/receivables-application.service';
import { PendingPayment } from '@features/finance/treasury/receivables/models/interfaces/pending-payment.interface';
import { PendingPaymentApproveDialogComponent } from '@features/finance/treasury/receivables/components/pending-payment-approve-dialog/pending-payment-approve-dialog.component';
import { PendingPaymentRejectDialogComponent } from '@features/finance/treasury/receivables/components/pending-payment-reject-dialog/pending-payment-reject-dialog.component';
import { PendingPaymentActionDialogHostComponent } from '@features/finance/treasury/receivables/components/pending-payment-action-dialog-host/pending-payment-action-dialog-host.component';

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

describe('PendingPaymentActionDialogHostComponent', () => {
  let fixture: ComponentFixture<PendingPaymentActionDialogHostComponent>;
  let component: PendingPaymentActionDialogHostComponent;
  let actions: PendingPaymentActionDialogService;
  let api: { listPendingPayments: ReturnType<typeof vi.fn> };
  let messages: { add: ReturnType<typeof vi.fn> };
  let application: {
    pendingPaymentsChange: Subject<void>;
    customerDebtChange: Subject<void>;
  };

  beforeEach(async () => {
    TestBed.resetTestingModule();
    vi.clearAllMocks();
    api = { listPendingPayments: vi.fn(() => of([payment])) };
    messages = { add: vi.fn() };
    application = {
      pendingPaymentsChange: new Subject<void>(),
      customerDebtChange: new Subject<void>(),
    };

    await TestBed.configureTestingModule({
      imports: [PendingPaymentActionDialogHostComponent],
      providers: [
        { provide: ReceivablesApiService, useValue: api },
        { provide: ReceivablesApplicationService, useValue: application },
        { provide: MessageService, useValue: messages },
      ],
    })
      .overrideComponent(PendingPaymentApproveDialogComponent, { set: { template: '', imports: [] } })
      .overrideComponent(PendingPaymentRejectDialogComponent, { set: { template: '', imports: [] } })
      .compileComponents();

    fixture = TestBed.createComponent(PendingPaymentActionDialogHostComponent);
    component = fixture.componentInstance;
    actions = TestBed.inject(PendingPaymentActionDialogService);
    fixture.detectChanges();
  });

  it('starts with every dialog hidden', () => {
    expect(component.approveVisible()).toBe(false);
    expect(component.rejectVisible()).toBe(false);
    expect(component.selectedPayment()).toBeNull();
  });

  it('loads the pending payment and opens the approve dialog for an approve request', () => {
    actions.open({ paymentId: 'payment-1', action: 'approve' });
    fixture.detectChanges();

    expect(api.listPendingPayments).toHaveBeenCalledWith('APPROVE');
    expect(component.selectedPayment()).toEqual(payment);
    expect(component.approveVisible()).toBe(true);
    expect(component.rejectVisible()).toBe(false);
    expect(messages.add).not.toHaveBeenCalled();
  });

  it('loads the pending payment and opens the reject dialog for a reject request', () => {
    actions.open({ paymentId: 'payment-1', action: 'reject' });
    fixture.detectChanges();

    expect(api.listPendingPayments).toHaveBeenCalledWith('REJECT');
    expect(component.selectedPayment()).toEqual(payment);
    expect(component.rejectVisible()).toBe(true);
    expect(component.approveVisible()).toBe(false);
    expect(messages.add).not.toHaveBeenCalled();
  });

  it('informs and clears the request when the payment is not available', () => {
    api.listPendingPayments.mockReturnValue(of([]));

    actions.open({ paymentId: 'missing', action: 'approve' });
    fixture.detectChanges();

    expect(component.approveVisible()).toBe(false);
    expect(component.rejectVisible()).toBe(false);
    expect(messages.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'finance.treasury.receivables.messages.unableToLoadPendingPayment',
    });
    expect(actions.request()).toBeNull();
  });

  it('refreshes receivables and closes the request after approving', () => {
    const pendingRefresh = vi.spyOn(application.pendingPaymentsChange, 'next');
    const debtRefresh = vi.spyOn(application.customerDebtChange, 'next');
    actions.open({ paymentId: 'payment-1', action: 'approve' });
    fixture.detectChanges();

    component.onApproved();

    expect(pendingRefresh).toHaveBeenCalledTimes(1);
    expect(debtRefresh).toHaveBeenCalledTimes(1);
    expect(actions.request()).toBeNull();
  });

  it('refreshes receivables and closes the request after rejecting', () => {
    const pendingRefresh = vi.spyOn(application.pendingPaymentsChange, 'next');
    const debtRefresh = vi.spyOn(application.customerDebtChange, 'next');
    actions.open({ paymentId: 'payment-1', action: 'reject' });
    fixture.detectChanges();

    component.onRejected();

    expect(pendingRefresh).toHaveBeenCalledTimes(1);
    expect(debtRefresh).toHaveBeenCalledTimes(1);
    expect(actions.request()).toBeNull();
  });

  it('clears the selection and the request when the opened dialog hides', () => {
    actions.open({ paymentId: 'payment-1', action: 'approve' });
    fixture.detectChanges();

    component.onApproveVisibleChange(false);

    expect(component.approveVisible()).toBe(false);
    expect(component.selectedPayment()).toBeNull();
    expect(actions.request()).toBeNull();
  });
});
