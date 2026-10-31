import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { signal } from '@angular/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { of } from 'rxjs';
import { MessageService } from 'primeng/api';
import { LanguageService } from '@core/i18n/language.service';
import { CustomerBalanceApiService } from '@features/partners/customers/services/api/customer-balance-api.service';
import { PaymentMethodApiService } from '@features/finance/treasury/payment-methods/services/api/payment-method-api.service';
import { InvoiceApiService } from '@features/finance/billing/invoices/services/api/invoice-api.service';
import { InvoiceApplicationService } from '@features/finance/billing/invoices/services/application/invoice-application.service';
import { InvoiceDetails } from '@features/finance/billing/invoices/models/interfaces/invoice-details.interface';
import { InvoiceStatus } from '@features/finance/billing/invoices/models/enums/invoice-status.enum';
import { PaymentType } from '@features/finance/billing/invoices/models/enums/payment-type.enum';
import { CancelInvoiceDialogComponent } from '@features/finance/billing/invoices/components/cancel-invoice-dialog/cancel-invoice-dialog.component';
import {
  ConfirmInvoiceDialogComponent,
  ConfirmInvoiceSubmit,
} from '@features/finance/billing/invoices/components/confirm-invoice-dialog/confirm-invoice-dialog.component';
import { DuplicateInvoiceDialogComponent } from '@features/finance/billing/invoices/components/duplicate-invoice-dialog/duplicate-invoice-dialog.component';
import { InvoiceActionDialogService } from '@core/layouts/services/invoice-action-dialog.service';
import { InvoiceActionDialogHostComponent } from './invoice-action-dialog-host.component';

const invoiceDetails: InvoiceDetails = {
  id: 'invoice-1',
  invoiceNumber: 'FAC-001',
  customerId: 'customer-1',
  customerName: 'Acme',
  customerRif: 'J-12345678-9',
  createdBy: 'user-1',
  createdByName: 'User',
  orderId: null,
  orderNumber: null,
  status: InvoiceStatus.DRAFT,
  statusLabel: 'Borrador',
  paymentType: PaymentType.CASH,
  notes: null,
  subtotal: 100,
  creditApplied: 0,
  debitApplied: 0,
  total: 100,
  notesList: [],
  cancelledAt: null,
  cancelledReason: null,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  lines: [
    {
      id: 'line-1',
      productId: 'product-1',
      productName: 'Product',
      productCode: 'P-1',
      quantity: 1,
      unitPrice: 100,
      lineTotal: 100,
      warehouseAllocations: [],
      returnedQuantity: 0,
    },
  ],
  returnedTotal: 0,
  returnStatus: null,
  returns: [],
};

const confirmData: ConfirmInvoiceSubmit = {
  useBalance: false,
  balanceAmount: 0,
  paymentMethodId: 'pm-1',
};

describe('InvoiceActionDialogHostComponent', () => {
  let fixture: ComponentFixture<InvoiceActionDialogHostComponent>;
  let component: InvoiceActionDialogHostComponent;
  let actions: InvoiceActionDialogService;
  let messages: { add: ReturnType<typeof vi.fn> };
  let invoiceApi: { getById: ReturnType<typeof vi.fn> };
  let invoiceService: {
    confirm: ReturnType<typeof vi.fn>;
    cancel: ReturnType<typeof vi.fn>;
    duplicate: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    TestBed.resetTestingModule();
    messages = { add: vi.fn() };
    invoiceApi = { getById: vi.fn(() => of(invoiceDetails)) };
    invoiceService = {
      confirm: vi.fn(() => of(invoiceDetails)),
      cancel: vi.fn(() => of(invoiceDetails)),
      duplicate: vi.fn(() => of(invoiceDetails)),
    };

    await TestBed.configureTestingModule({
      imports: [InvoiceActionDialogHostComponent],
      providers: [
        { provide: InvoiceApplicationService, useValue: invoiceService },
        { provide: InvoiceApiService, useValue: invoiceApi },
        { provide: MessageService, useValue: messages },
        { provide: LanguageService, useValue: { locale: signal('es'), language: signal('es') } },
        {
          provide: CustomerBalanceApiService,
          useValue: { getBalance: vi.fn(() => of({ totalBalance: 0 })) },
        },
        {
          provide: PaymentMethodApiService,
          useValue: { getAll: vi.fn(() => of({ content: [] })) },
        },
      ],
    })
      .overrideComponent(ConfirmInvoiceDialogComponent, { set: { template: '' } })
      .overrideComponent(CancelInvoiceDialogComponent, { set: { template: '' } })
      .overrideComponent(DuplicateInvoiceDialogComponent, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(InvoiceActionDialogHostComponent);
    component = fixture.componentInstance;
    actions = TestBed.inject(InvoiceActionDialogService);
    fixture.detectChanges();
  });

  it('fetches the invoice and shows the confirm dialog', () => {
    actions.open({ invoiceId: 'invoice-1', invoiceNumber: 'FAC-001', action: 'confirm' });
    fixture.detectChanges();

    expect(invoiceApi.getById).toHaveBeenCalledWith('invoice-1');
    expect(component.confirmVisible()).toBe(true);
    expect(component.invoice()?.id).toBe('invoice-1');
    expect(fixture.debugElement.query(By.directive(ConfirmInvoiceDialogComponent))).not.toBeNull();
  });

  it('fetches the invoice and shows the cancel dialog', () => {
    actions.open({ invoiceId: 'invoice-1', invoiceNumber: 'FAC-001', action: 'cancel' });
    fixture.detectChanges();

    expect(invoiceApi.getById).toHaveBeenCalledWith('invoice-1');
    expect(component.cancelVisible()).toBe(true);
    expect(component.invoice()?.invoiceNumber).toBe('FAC-001');
    expect(fixture.debugElement.query(By.directive(CancelInvoiceDialogComponent))).not.toBeNull();
  });

  it('opens the duplicate dialog without loading the invoice in the host', () => {
    actions.open({ invoiceId: 'invoice-1', invoiceNumber: 'FAC-001', action: 'duplicate' });
    fixture.detectChanges();

    expect(component.invoice()).toBeNull();
    expect(component.duplicateVisible()).toBe(true);
    expect(component.duplicateInvoiceId()).toBe('invoice-1');
    expect(
      fixture.debugElement.query(By.directive(DuplicateInvoiceDialogComponent)),
    ).not.toBeNull();
  });

  it('confirms the requested invoice', () => {
    actions.open({ invoiceId: 'invoice-1', invoiceNumber: 'FAC-001', action: 'confirm' });
    fixture.detectChanges();

    component.onConfirm(confirmData);

    expect(invoiceService.confirm).toHaveBeenCalledWith('invoice-1', confirmData);
    expect(messages.add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'success', detail: 'Factura confirmada exitosamente' }),
    );
    expect(actions.request()).toBeNull();
    expect(component.submitting()).toBe(false);
  });

  it('cancels the requested invoice', () => {
    actions.open({ invoiceId: 'invoice-1', invoiceNumber: 'FAC-001', action: 'cancel' });
    fixture.detectChanges();

    component.onCancelConfirm({ invoiceId: 'invoice-1', reason: 'Customer request' });

    expect(invoiceService.cancel).toHaveBeenCalledWith('invoice-1', 'Customer request');
    expect(messages.add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'success', detail: 'Factura cancelada exitosamente' }),
    );
    expect(actions.request()).toBeNull();
  });

  it('duplicates the requested invoice', () => {
    actions.open({ invoiceId: 'invoice-1', invoiceNumber: 'FAC-001', action: 'duplicate' });
    fixture.detectChanges();

    component.onDuplicateConfirm({ invoiceId: 'invoice-1', customerId: 'customer-2' });

    expect(invoiceService.duplicate).toHaveBeenCalledWith('invoice-1', 'customer-2');
    expect(messages.add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'success', detail: 'Factura duplicada exitosamente' }),
    );
    expect(actions.request()).toBeNull();
  });

  it('clears every signal when the dialogs close', () => {
    actions.open({ invoiceId: 'invoice-1', invoiceNumber: 'FAC-001', action: 'confirm' });
    fixture.detectChanges();

    component.onClose();

    expect(component.confirmVisible()).toBe(false);
    expect(component.cancelVisible()).toBe(false);
    expect(component.duplicateVisible()).toBe(false);
    expect(component.duplicateInvoiceId()).toBe('');
    expect(component.invoice()).toBeNull();
    expect(actions.request()).toBeNull();
  });
});
