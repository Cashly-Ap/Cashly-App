import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { PendingPaymentsTabComponent } from './pending-payments-tab.component';
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
  voucherPath: null,
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
            approvePayment: vi.fn(),
            rejectPayment: vi.fn(),
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
});
