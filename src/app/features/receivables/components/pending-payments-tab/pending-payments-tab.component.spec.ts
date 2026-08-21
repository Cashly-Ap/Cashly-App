import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { PendingPaymentsTabComponent } from '@features/receivables/components/pending-payments-tab/pending-payments-tab.component';
import { ReceivablesApiService } from '@features/receivables/services/api/receivables-api.service';
import { PendingPayment } from '@features/receivables/models/interfaces';

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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingPaymentsTabComponent],
      providers: [
        {
          provide: ReceivablesApiService,
          useValue: {
            listPendingPayments: vi.fn(() => of([payment])),
            approvePayment: vi.fn(() => of({})),
            rejectPayment: vi.fn(() => of({})),
          },
        },
        { provide: MessageService, useValue: { add: vi.fn() } },
      ],
    }).compileComponents();

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

  it('should show payment details in both validation dialogs', () => {
    component.openApprove({ ...payment, notes: 'Transferencia validada por el cliente' });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Cliente');
    expect(fixture.nativeElement.textContent).toContain('FAC-001');
    expect(fixture.nativeElement.textContent).toContain('Transferencia validada por el cliente');

    component.openReject(payment);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Método de pago');
    expect(fixture.nativeElement.textContent).toContain('Fecha de pago');
    expect(fixture.nativeElement.textContent).toContain('Referencia');
  });

  it('should notify the page after approving or rejecting a payment', () => {
    const validated = vi.fn();
    component.paymentValidated.subscribe(validated);

    component.openApprove(payment);
    component.reason.set('Verificado');
    component.submitApprove();
    expect(validated).toHaveBeenCalledTimes(1);

    component.openReject(payment);
    component.reason.set('Referencia inválida');
    component.submitReject();
    expect(validated).toHaveBeenCalledTimes(2);
  });

  it('should render the voucher button disabled when voucherUrl is null', () => {
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector(
      'p-button[pTooltip="Ver justificante"] button',
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
      'p-button[pTooltip="Ver justificante"] button',
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
