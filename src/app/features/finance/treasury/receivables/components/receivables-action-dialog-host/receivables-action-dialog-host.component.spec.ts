import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Subject, of } from 'rxjs';
import { MessageService } from 'primeng/api';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PdfViewerService } from '@core/pdf-viewer';
import { LanguageService } from '@core/i18n/language.service';
import { TranslationService } from '@core/i18n/translation.service';
import { UserPreferencesService } from '@core/preferences/user-preferences.service';
import { CustomerBalanceApiService } from '@features/partners/customers/services/api/customer-balance-api.service';
import { InvoiceApiService } from '@features/finance/billing/invoices/services/api/invoice-api.service';
import { PaymentMethodApiService } from '@features/finance/treasury/payment-methods/services/api/payment-method-api.service';
import { ReceivablesApiService } from '@features/finance/treasury/receivables/services/api/receivables-api.service';
import { ReceivablesApplicationService } from '@features/finance/treasury/receivables/services/application/receivables-application.service';
import { CustomerDebtDialogComponent } from '@features/finance/treasury/receivables/components/customer-debt-dialog/customer-debt-dialog.component';
import {
  PaymentFormDialogComponent,
  PaymentSubmitEvent,
} from '@features/finance/treasury/receivables/components/payment-form-dialog/payment-form-dialog.component';
import { PaymentHistoryDialogComponent } from '@features/finance/treasury/receivables/components/payment-history-dialog/payment-history-dialog.component';
import { CustomerDebtSummary } from '@features/finance/treasury/receivables/models/interfaces/customer-debt-summary.interface';
import { CustomerInvoiceDebt } from '@features/finance/treasury/receivables/models/interfaces/customer-invoice-debt.interface';
import { PayInvoiceRequest } from '@features/finance/treasury/receivables/models/interfaces/payment-request.interface';
import { ReceivablesActionDialogService } from '@core/layouts/services/receivables-action-dialog.service';
import { ReceivablesActionDialogHostComponent } from './receivables-action-dialog-host.component';

const customerDebt: CustomerDebtSummary = {
  customerId: 'customer-1',
  customerName: 'Acme',
  customerRif: 'J-12345678-9',
  customerPhone: null,
  customerEmail: null,
  totalDebt: 150,
  pendingPaymentsAmount: 0,
  availableDebt: 150,
  creditLimit: 0,
  availableCredit: 0,
  customerBalance: 20,
  invoicesWithDebt: 1,
  pendingPaymentsCount: 0,
  pendingInvoicesCount: 0,
  pendingInvoicesAmount: 0,
  validatedInvoicesCount: 1,
  debtBreakdown: {},
};

const invoice: CustomerInvoiceDebt = {
  invoiceId: 'invoice-1',
  invoiceNumber: 'INV-001',
  status: 'PENDING',
  displayStatus: 'PENDING',
  invoiceDate: '2026-01-01',
  subtotal: 100,
  returnedTotal: 0,
  totalPaid: 0,
  creditApplied: 0,
  debitApplied: 0,
  total: 100,
  balance: 100,
  realBalance: 100,
  pendingPayment: null,
  merchantId: null,
  merchantName: null,
  lineCount: 1,
  hasDeliveryFile: null,
};

const paymentRequest: PayInvoiceRequest = {
  paymentMethodId: 'payment-method-1',
  paymentDate: '2026-10-31',
  amount: 100,
};

const paymentSubmit: PaymentSubmitEvent = { request: paymentRequest };

describe('ReceivablesActionDialogHostComponent', () => {
  let fixture: ComponentFixture<ReceivablesActionDialogHostComponent>;
  let component: ReceivablesActionDialogHostComponent;
  let actions: ReceivablesActionDialogService;
  let pdfViewer: { open: ReturnType<typeof vi.fn> };
  let currentCustomer: WritableSignal<CustomerDebtSummary | null>;
  let receivableService: {
    currentCustomer: WritableSignal<CustomerDebtSummary | null>;
    customerInvoices: WritableSignal<CustomerInvoiceDebt[]>;
    loading: WritableSignal<boolean>;
    totalCustomerInvoices: WritableSignal<number>;
    customerDebtChange: Subject<void>;
    clearCurrentCustomer: ReturnType<typeof vi.fn>;
    loadCustomerDebt: ReturnType<typeof vi.fn>;
    loadCustomerInvoices: ReturnType<typeof vi.fn>;
    payInvoice: ReturnType<typeof vi.fn>;
    payAllCustomerDebt: ReturnType<typeof vi.fn>;
    payPartialDebt: ReturnType<typeof vi.fn>;
  };

  const debtDialog = () =>
    fixture.debugElement.query(By.directive(CustomerDebtDialogComponent))
      .componentInstance as CustomerDebtDialogComponent;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    currentCustomer = signal<CustomerDebtSummary | null>(null);
    receivableService = {
      currentCustomer,
      customerInvoices: signal<CustomerInvoiceDebt[]>([]),
      loading: signal(false),
      totalCustomerInvoices: signal(0),
      customerDebtChange: new Subject<void>(),
      clearCurrentCustomer: vi.fn(() => currentCustomer.set(null)),
      loadCustomerDebt: vi.fn(() => {
        currentCustomer.set(customerDebt);
        return of(customerDebt);
      }),
      loadCustomerInvoices: vi.fn(() => of({ content: [], totalElements: 0 })),
      payInvoice: vi.fn(() => of({})),
      payAllCustomerDebt: vi.fn(() => of({})),
      payPartialDebt: vi.fn(() => of({})),
    };
    pdfViewer = { open: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ReceivablesActionDialogHostComponent],
      providers: [
        { provide: ReceivablesApplicationService, useValue: receivableService },
        { provide: PdfViewerService, useValue: pdfViewer },
        { provide: MessageService, useValue: { add: vi.fn() } },
        { provide: LanguageService, useValue: { locale: signal('es') } },
        { provide: TranslationService, useValue: { t: (key: string) => key } },
        { provide: UserPreferencesService, useValue: { colorMode: signal('minimal') } },
        {
          provide: CustomerBalanceApiService,
          useValue: {
            getBalance: vi.fn(() => of({ totalBalance: 0 })),
            getTransactions: vi.fn(() => of({ content: [], totalElements: 0 })),
            createAdvance: vi.fn(() => of({ totalBalance: 0 })),
            createRefund: vi.fn(() => of({ totalBalance: 0 })),
          },
        },
        { provide: InvoiceApiService, useValue: { getById: vi.fn(() => of({})) } },
        {
          provide: PaymentMethodApiService,
          useValue: { getAll: vi.fn(() => of({ content: [] })) },
        },
        {
          provide: ReceivablesApiService,
          useValue: { getCustomerPaymentHistory: vi.fn(() => of({ content: [] })) },
        },
      ],
    })
      .overrideComponent(CustomerDebtDialogComponent, { set: { template: '' } })
      .overrideComponent(PaymentFormDialogComponent, { set: { template: '' } })
      .overrideComponent(PaymentHistoryDialogComponent, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(ReceivablesActionDialogHostComponent);
    component = fixture.componentInstance;
    actions = TestBed.inject(ReceivablesActionDialogService);
    fixture.detectChanges();
  });

  it('shows the customer debt dialog for the view action', () => {
    actions.open({ customerId: 'customer-1', customerName: 'Acme', action: 'view' });
    fixture.detectChanges();

    expect(component.debtVisible()).toBe(true);
    expect(component.customerId()).toBe('customer-1');
    expect(component.customerName()).toBe('Acme');
    expect(fixture.debugElement.query(By.directive(CustomerDebtDialogComponent))).not.toBeNull();
  });

  it('loads the debt and opens the payment form in all mode without opening the debt dialog', () => {
    actions.open({ customerId: 'customer-1', customerName: 'Acme', action: 'pay_all' });
    fixture.detectChanges();

    expect(receivableService.loadCustomerDebt).toHaveBeenCalledWith('customer-1');
    expect(component.debtVisible()).toBe(false);
    expect(component.paymentFormVisible()).toBe(true);
    expect(component.paymentFormMode()).toBe('all');
    expect(component.paymentCustomerName()).toBe('Acme');
    expect(component.paymentTotalDebt()).toBe(150);
  });

  it('loads the debt and opens the payment form in partial mode without opening the debt dialog', () => {
    actions.open({ customerId: 'customer-1', customerName: 'Acme', action: 'pay_partial' });
    fixture.detectChanges();

    expect(receivableService.loadCustomerDebt).toHaveBeenCalledWith('customer-1');
    expect(component.debtVisible()).toBe(false);
    expect(component.paymentFormVisible()).toBe(true);
    expect(component.paymentFormMode()).toBe('partial');
    expect(component.paymentCustomerName()).toBe('Acme');
    expect(component.paymentTotalDebt()).toBe(150);
  });

  it('opens the payment form in single mode from the debt dialog pay invoice output', () => {
    actions.open({ customerId: 'customer-1', customerName: 'Acme', action: 'view' });
    fixture.detectChanges();

    debtDialog().payInvoice.emit(invoice);

    expect(component.paymentFormVisible()).toBe(true);
    expect(component.paymentFormMode()).toBe('single');
    expect(component.paymentInvoice()).toBe(invoice);
    expect(component.paymentCustomerName()).toBe('Acme');
    expect(component.paymentTotalDebt()).toBe(invoice.balance);
  });

  it('pays a single invoice and refreshes the debt state', () => {
    const next = vi.spyOn(receivableService.customerDebtChange, 'next');
    actions.open({ customerId: 'customer-1', customerName: 'Acme', action: 'view' });
    fixture.detectChanges();
    component.onPayInvoice(invoice);

    component.onSubmitPayment(paymentSubmit);

    expect(receivableService.payInvoice).toHaveBeenCalledWith(invoice.invoiceId, paymentRequest);
    expect(next).toHaveBeenCalled();
    expect(component.paymentFormVisible()).toBe(false);
    expect(component.paymentSubmitting()).toBe(false);
  });

  it('pays the whole customer debt in all mode', () => {
    const next = vi.spyOn(receivableService.customerDebtChange, 'next');
    actions.open({ customerId: 'customer-1', customerName: 'Acme', action: 'pay_all' });
    fixture.detectChanges();

    component.onSubmitPayment(paymentSubmit);

    expect(receivableService.payAllCustomerDebt).toHaveBeenCalledWith('customer-1', paymentRequest);
    expect(receivableService.payInvoice).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('pays a partial customer debt in partial mode', () => {
    const next = vi.spyOn(receivableService.customerDebtChange, 'next');
    actions.open({ customerId: 'customer-1', customerName: 'Acme', action: 'pay_partial' });
    fixture.detectChanges();

    component.onSubmitPayment(paymentSubmit);

    expect(receivableService.payPartialDebt).toHaveBeenCalledWith('customer-1', paymentRequest);
    expect(next).toHaveBeenCalled();
  });

  it('opens the payment history for the selected invoice', () => {
    actions.open({ customerId: 'customer-1', customerName: 'Acme', action: 'view' });
    fixture.detectChanges();

    debtDialog().viewInvoicePaymentHistory.emit(invoice);

    expect(component.paymentHistoryVisible()).toBe(true);
    expect(component.paymentHistoryCustomerId()).toBe('customer-1');
    expect(component.paymentHistoryInvoiceId()).toBe(invoice.invoiceId);
  });

  it('resets the payment form state when it closes', () => {
    component.onPayInvoice(invoice);
    expect(component.paymentFormVisible()).toBe(true);

    component.onClosePaymentForm();

    expect(component.paymentFormVisible()).toBe(false);
    expect(component.paymentInvoice()).toBeNull();
    expect(component.paymentCustomerName()).toBe('');
    expect(component.paymentTotalDebt()).toBe(0);
  });

  it('opens the balance action on the debt dialog for refunds', () => {
    const dialog = debtDialog();
    const openBalanceAction = vi.spyOn(dialog, 'openBalanceAction');

    actions.open({ customerId: 'customer-1', customerName: 'Acme', action: 'refund' });
    fixture.detectChanges();

    expect(component.debtVisible()).toBe(false);
    expect(openBalanceAction).toHaveBeenCalledWith('refund', 'customer-1');
  });

  it('opens the balance action on the debt dialog for advances', () => {
    const dialog = debtDialog();
    const openBalanceAction = vi.spyOn(dialog, 'openBalanceAction');

    actions.open({ customerId: 'customer-1', customerName: 'Acme', action: 'advance' });
    fixture.detectChanges();

    expect(openBalanceAction).toHaveBeenCalledWith('advance', 'customer-1');
  });

  it('clears the pending request when the debt dialog closes', () => {
    actions.open({ customerId: 'customer-1', customerName: 'Acme', action: 'view' });
    fixture.detectChanges();

    debtDialog().close.emit();

    expect(component.debtVisible()).toBe(false);
    expect(component.customerId()).toBe('');
    expect(receivableService.clearCurrentCustomer).toHaveBeenCalled();
    expect(actions.request()).toBeNull();
  });

  it('opens the pdf viewer for the selected invoice', () => {
    component.onViewInvoicePdf(invoice);

    expect(pdfViewer.open).toHaveBeenCalledWith({
      url: '/api/reports/invoices/invoice-1/pdf',
      title: 'Factura #INV-001',
      fileName: 'factura-INV-001.pdf',
    });
  });
});
