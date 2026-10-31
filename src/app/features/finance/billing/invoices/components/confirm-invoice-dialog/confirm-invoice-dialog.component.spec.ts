import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, Component } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of } from 'rxjs';
import { MessageService } from 'primeng/api';
import { AuthorizationService } from '@features/platform/auth/authorization/services/authorization.service';
import { LanguageService } from '@core/i18n/language.service';
import { CustomerBalanceApiService } from '@features/partners/customers/services/api/customer-balance-api.service';
import { PaymentMethodApiService } from '@features/finance/treasury/payment-methods/services/api/payment-method-api.service';
import { PaymentMethodList } from '@features/finance/treasury/payment-methods/models/interfaces/payment-method.interface';
import { InvoiceList } from '@features/finance/billing/invoices/models/interfaces/invoice-list.interface';
import { InvoiceStatus } from '@features/finance/billing/invoices/models/enums/invoice-status.enum';
import { PaymentType } from '@features/finance/billing/invoices/models/enums/payment-type.enum';
import { ConfirmInvoiceDialogComponent } from '@features/finance/billing/invoices/components/confirm-invoice-dialog/confirm-invoice-dialog.component';

@Component({
  template: `<app-confirm-invoice-dialog
    [visible]="visible"
    [invoice]="invoice"
    [submitting]="submitting"
    (confirmed)="onConfirmed($event)"
    (cancelled)="onCancelled()"
  ></app-confirm-invoice-dialog>`,
  imports: [ConfirmInvoiceDialogComponent],
})
class HostComponent {
  visible = false;
  invoice: InvoiceList | null = null;
  submitting = false;
  onConfirmed = vi.fn();
  onCancelled = vi.fn();
}

const paymentMethod: PaymentMethodList = {
  id: 'pm-1',
  code: 'CASH',
  name: 'Efectivo',
  description: null,
  isActive: true,
  hasAssociatedRecords: false,
  createdAt: '2026-01-01T00:00:00Z',
};

const cashInvoice: InvoiceList = {
  id: 'inv-001',
  invoiceNumber: 'FAC-001',
  customerId: 'customer-1',
  customerName: 'Acme',
  status: InvoiceStatus.DRAFT,
  statusLabel: 'Borrador',
  paymentType: PaymentType.CASH,
  subtotal: 100,
  total: 100,
  paidAmount: 0,
  creditApplied: 0,
  debitApplied: 0,
  lineCount: 1,
  orderId: null,
  orderNumber: null,
  createdAt: '2026-01-01T00:00:00Z',
  returnStatus: null,
};

const creditInvoice: InvoiceList = {
  ...cashInvoice,
  id: 'inv-002',
  invoiceNumber: 'FAC-002',
  paymentType: PaymentType.CREDIT,
};

describe('ConfirmInvoiceDialogComponent', () => {
  let hostComponent: HostComponent;
  let fixture: ComponentFixture<HostComponent>;
  let dialog: ConfirmInvoiceDialogComponent;
  let balanceApi: { getBalance: ReturnType<typeof vi.fn> };
  let paymentMethodApi: { getAll: ReturnType<typeof vi.fn> };
  let messageService: { add: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    balanceApi = { getBalance: vi.fn(() => of({ totalBalance: 30 })) };
    paymentMethodApi = {
      getAll: vi.fn(() =>
        of({
          content: [paymentMethod],
          totalElements: 1,
          totalPages: 1,
          size: 1,
          number: 0,
          first: true,
          last: true,
          empty: false,
        }),
      ),
    };
    messageService = { add: vi.fn() };

    TestBed.configureTestingModule({
      imports: [HostComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideRouter([]),
        { provide: AuthorizationService, useValue: { can: () => true } },
        { provide: MessageService, useValue: messageService },
        { provide: CustomerBalanceApiService, useValue: balanceApi },
        { provide: PaymentMethodApiService, useValue: paymentMethodApi },
        { provide: LanguageService, useValue: { locale: () => 'es', language: () => 'es' } },
      ],
    });

    fixture = TestBed.createComponent(HostComponent);
    hostComponent = fixture.componentInstance;
    dialog = fixture.debugElement.children[0].componentInstance;
  });

  function open(invoice: InvoiceList): void {
    hostComponent.invoice = invoice;
    hostComponent.visible = true;
    fixture.detectChanges();
  }

  it('starts without state', () => {
    expect(dialog.customerBalanceConfirm()).toBe(0);
    expect(dialog.useBalanceConfirm()).toBe(false);
    expect(dialog.paymentLines()).toEqual([]);
  });

  it('loads the balance and payment methods for cash invoices', () => {
    open(cashInvoice);

    expect(balanceApi.getBalance).toHaveBeenCalledWith('customer-1');
    expect(paymentMethodApi.getAll).toHaveBeenCalledWith({ active: true });
    expect(dialog.customerBalanceConfirm()).toBe(30);
    expect(dialog.paymentMethods()).toEqual([paymentMethod]);
  });

  it('does not load the balance for credit invoices', () => {
    open(creditInvoice);

    expect(balanceApi.getBalance).not.toHaveBeenCalled();
    expect(paymentMethodApi.getAll).not.toHaveBeenCalled();
  });

  it('resets the state every time the invoice changes', () => {
    open(cashInvoice);
    dialog.useBalanceConfirm.set(true);
    dialog.confirmationPassword.set('secret');
    dialog.addPaymentLine();
    dialog.updatePaymentLine(0, 'methodId', 'pm-1');
    dialog.updatePaymentLine(0, 'amount', 10);

    hostComponent.invoice = creditInvoice;
    fixture.detectChanges();

    expect(dialog.paymentLines()).toEqual([]);
    expect(dialog.useBalanceConfirm()).toBe(false);
    expect(dialog.confirmationPassword()).toBe('');
    expect(dialog.customerBalanceConfirm()).toBe(0);
  });

  it('emits the balance and payment method for cash invoices', () => {
    open(cashInvoice);
    dialog.useBalanceConfirm.set(true);
    dialog.addPaymentLine();
    dialog.updatePaymentLine(0, 'methodId', 'pm-1');
    dialog.updatePaymentLine(0, 'amount', 70);

    dialog.submitConfirm();

    expect(hostComponent.onConfirmed).toHaveBeenCalledWith({
      useBalance: true,
      balanceAmount: 30,
      paymentMethodId: 'pm-1',
    });
  });

  it('caps the payment line at the remaining amount', () => {
    open(cashInvoice);
    dialog.addPaymentLine();
    dialog.updatePaymentLine(0, 'amount', 500);

    expect(dialog.paymentLines()[0].amount).toBe(100);
    expect(dialog.totalPayments()).toBe(100);
    expect(dialog.allPaymentsValid()).toBe(false);
  });

  it('emits the confirmation password for credit invoices', () => {
    open(creditInvoice);
    dialog.confirmationPassword.set('secret');

    dialog.submitConfirm();

    expect(hostComponent.onConfirmed).toHaveBeenCalledWith({
      useBalance: false,
      balanceAmount: 0,
      confirmationPassword: 'secret',
    });
  });

  it('warns and does not confirm credit invoices without password', () => {
    open(creditInvoice);

    dialog.submitConfirm();

    expect(hostComponent.onConfirmed).not.toHaveBeenCalled();
    expect(messageService.add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'warn', detail: 'Debe ingresar su contraseña.' }),
    );
  });

  it('emits cancelled when the dialog is dismissed', () => {
    open(cashInvoice);

    dialog.onCancel();

    expect(hostComponent.onCancelled).toHaveBeenCalled();
  });
});
