import { provideRouter } from '@angular/router';
import { AuthorizationService } from '@features/platform/auth/authorization/services/authorization.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { Subject, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PendingPaymentsTabComponent } from '@features/finance/treasury/receivables/components/pending-payments-tab/pending-payments-tab.component';
import { PendingPaymentApproveDialogComponent } from '@features/finance/treasury/receivables/components/pending-payment-approve-dialog/pending-payment-approve-dialog.component';
import { PendingPaymentRejectDialogComponent } from '@features/finance/treasury/receivables/components/pending-payment-reject-dialog/pending-payment-reject-dialog.component';
import { ReceivablesApiService } from '@features/finance/treasury/receivables/services/api/receivables-api.service';
import { ReceivablesApplicationService } from '@features/finance/treasury/receivables/services/application/receivables-application.service';
import { PendingPayment } from '@features/finance/treasury/receivables/models/interfaces/pending-payment.interface';

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

describe('PendingPaymentsTabComponent', () => {
  let fixture: ComponentFixture<PendingPaymentsTabComponent>;
  let component: PendingPaymentsTabComponent;
  let api: { listPendingPayments: ReturnType<typeof vi.fn> };
  let application: {
    pendingPaymentsChange: Subject<void>;
    customerDebtChange: Subject<void>;
  };

  beforeEach(async () => {
    TestBed.resetTestingModule();
    vi.clearAllMocks();
    api = { listPendingPayments: vi.fn(() => of([payment])) };
    application = {
      pendingPaymentsChange: new Subject<void>(),
      customerDebtChange: new Subject<void>(),
    };

    await TestBed.configureTestingModule({
      imports: [PendingPaymentsTabComponent],
      providers: [
        provideRouter([]),
        { provide: AuthorizationService, useValue: { can: () => true } },
        { provide: ReceivablesApiService, useValue: api },
        { provide: ReceivablesApplicationService, useValue: application },
        { provide: MessageService, useValue: { add: vi.fn() } },
      ],
    })
      .overrideComponent(PendingPaymentApproveDialogComponent, {
        set: { template: '', imports: [] },
      })
      .overrideComponent(PendingPaymentRejectDialogComponent, {
        set: { template: '', imports: [] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(PendingPaymentsTabComponent);
    component = fixture.componentInstance;
  });

  it('should open the focused pending payment for validation', () => {
    const handled = vi.fn();
    component.focusHandled.subscribe(handled);
    fixture.componentRef.setInput('focusPaymentId', 'payment-1');

    fixture.detectChanges();

    expect(component.selectedPayment()).toEqual(payment);
    expect(component.approveDialogVisible()).toBe(true);
    expect(handled).toHaveBeenCalledWith('payment-1');
  });

  it('should delegate the selected payment to both validation dialogs', () => {
    component.openApprove(payment);

    expect(component.selectedPayment()).toEqual(payment);
    expect(component.approveDialogVisible()).toBe(true);
    expect(component.rejectDialogVisible()).toBe(false);

    component.openReject(payment);

    expect(component.selectedPayment()).toEqual(payment);
    expect(component.rejectDialogVisible()).toBe(true);
  });

  it('should notify the page and reload after a dialog completes', () => {
    fixture.detectChanges();
    const validated = vi.fn();
    component.paymentValidated.subscribe(validated);
    const calls = api.listPendingPayments.mock.calls.length;

    component.onPaymentCompleted();

    expect(validated).toHaveBeenCalledTimes(1);
    expect(api.listPendingPayments.mock.calls.length).toBe(calls + 1);
  });

  it('should reload pending payments when the shared change signal fires', () => {
    fixture.detectChanges();
    const calls = api.listPendingPayments.mock.calls.length;

    application.pendingPaymentsChange.next();

    expect(api.listPendingPayments.mock.calls.length).toBe(calls + 1);
  });

  it('should render the voucher button disabled when voucherUrl is null', () => {
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector(
      'p-button[icon="pi pi-paperclip"] button',
    );

    expect(button.disabled).toBe(true);
  });

  it('should render the voucher button enabled and open the image viewer for an image voucherUrl', () => {
    const paymentWithVoucher: PendingPayment = {
      ...payment,
      voucherUrl: 'https://cdn.example.com/vouchers/payment-1.png',
    };
    fixture.detectChanges();
    component.payments.set([paymentWithVoucher]);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector(
      'p-button[icon="pi pi-paperclip"] button',
    );
    expect(button.disabled).toBe(false);

    component.openVoucher(paymentWithVoucher);

    expect(component.voucherViewerVisible()).toBe(true);
    expect(component.voucherViewerUrl()).toBe(paymentWithVoucher.voucherUrl);
  });

  it('should open a non-image voucherUrl directly in a new tab', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const paymentWithVoucher: PendingPayment = {
      ...payment,
      voucherUrl: 'https://cdn.example.com/vouchers/payment-1.pdf',
    };

    component.openVoucher(paymentWithVoucher);

    expect(openSpy).toHaveBeenCalledWith(paymentWithVoucher.voucherUrl, '_blank');
    expect(component.voucherViewerVisible()).toBe(false);

    openSpy.mockRestore();
  });

  it('should do nothing when opening a voucher with no url', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    component.openVoucher({ ...payment, voucherUrl: null });

    expect(openSpy).not.toHaveBeenCalled();
    expect(component.voucherViewerVisible()).toBe(false);

    openSpy.mockRestore();
  });
});
