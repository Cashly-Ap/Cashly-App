import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { BehaviorSubject, NEVER, of, Subject } from 'rxjs';
import { MessageService } from 'primeng/api';
import { Popover } from 'primeng/popover';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CustomerBalancePageComponent } from '@features/partners/customers/pages/customer-balance-page/customer-balance-page.component';
import { CustomerApiService } from '@features/partners/customers/services/api/customer-api.service';
import { CustomerBalanceApiService } from '@features/partners/customers/services/api/customer-balance-api.service';
import { InvoiceApiService } from '@features/finance/billing/invoices/services/api/invoice-api.service';
import { ReceivablesApiService } from '@features/finance/treasury/receivables/services/api/receivables-api.service';
import { CreditNoteApiService } from '@features/finance/billing/credit-notes/services/api/credit-note-api.service';
import { DebitNoteApiService } from '@features/finance/billing/debit-notes/services/api/debit-note-api.service';
import { ReturnApiService } from '@features/finance/billing/returns/services/api/return-api.service';
import { InvoiceStatus } from '@features/finance/billing/invoices/models/enums/invoice-status.enum';
import { CustomerPickerDialogComponent } from '@features/sales/orders/components/customer-picker-dialog/customer-picker-dialog.component';
import { CustomerType } from '@features/partners/customers/models/enums/customer-type.enum';
import { CustomerBalanceResponse } from '@features/partners/customers/models/interfaces/customer-balance.interface';
import { PaymentType } from '@features/finance/billing/invoices/models/enums/payment-type.enum';

describe('CustomerBalancePageComponent', () => {
  let fixture: ComponentFixture<CustomerBalancePageComponent>;
  let routeParams: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let customerApi: { getById: ReturnType<typeof vi.fn>; getForPicker: ReturnType<typeof vi.fn> };
  let balanceApi: {
    getBalance: ReturnType<typeof vi.fn>;
    getTransactions: ReturnType<typeof vi.fn>;
  };
  let invoiceApi: { getAll: ReturnType<typeof vi.fn> };
  let receivablesApi: { getCustomerPaymentHistory: ReturnType<typeof vi.fn> };
  let creditNoteApi: { getAll: ReturnType<typeof vi.fn> };
  let debitNoteApi: { getAll: ReturnType<typeof vi.fn> };
  let returnApi: { getAll: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    routeParams = new BehaviorSubject(convertToParamMap({ id: 'customer-001' }));
    customerApi = {
      getById: vi.fn().mockReturnValue(NEVER),
      getForPicker: vi
        .fn()
        .mockReturnValue(of({ content: [], totalElements: 0, totalPages: 0, number: 0 })),
    };
    balanceApi = {
      getBalance: vi.fn().mockReturnValue(NEVER),
      getTransactions: vi.fn().mockReturnValue(NEVER),
    };
    invoiceApi = { getAll: vi.fn().mockReturnValue(NEVER) };
    receivablesApi = { getCustomerPaymentHistory: vi.fn().mockReturnValue(NEVER) };
    creditNoteApi = { getAll: vi.fn().mockReturnValue(NEVER) };
    debitNoteApi = { getAll: vi.fn().mockReturnValue(NEVER) };
    returnApi = { getAll: vi.fn().mockReturnValue(NEVER) };

    await TestBed.configureTestingModule({
      imports: [CustomerBalancePageComponent],
      providers: [
        provideRouter([]),
        MessageService,
        { provide: CustomerApiService, useValue: customerApi },
        { provide: CustomerBalanceApiService, useValue: balanceApi },
        { provide: InvoiceApiService, useValue: invoiceApi },
        { provide: ReceivablesApiService, useValue: receivablesApi },
        { provide: CreditNoteApiService, useValue: creditNoteApi },
        { provide: DebitNoteApiService, useValue: debitNoteApi },
        { provide: ReturnApiService, useValue: returnApi },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: routeParams,
            snapshot: { paramMap: { get: () => 'customer-001' } },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerBalancePageComponent);
  });

  it('opens the shared customer selector from the balance page', () => {
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
    const searchButton = Array.from<HTMLButtonElement>(
      fixture.nativeElement.querySelectorAll('button'),
    ).find((button) => button.textContent?.includes('Buscar cliente'));
    expect(searchButton).toBeDefined();
    searchButton?.click();
    fixture.detectChanges();
    const picker = fixture.debugElement.query(By.directive(CustomerPickerDialogComponent));
    expect(picker).not.toBeNull();
    picker.componentInstance.customerSelected.emit({
      id: 'customer-002',
      code: 2,
      alias: 'Segundo',
      legalName: 'Segundo cliente',
      rif: '',
      type: CustomerType.INDIVIDUAL,
      active: true,
      deletable: true,
    });
    expect(navigate).toHaveBeenCalledWith(['/partners/customers', 'customer-002', 'balance']);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.directive(CustomerPickerDialogComponent))).toBeNull();
  });

  it('loads a new customer when the balance route changes and discards stale responses', () => {
    const firstBalance = new Subject<CustomerBalanceResponse>();
    const secondBalance = new Subject<CustomerBalanceResponse>();
    customerApi.getById.mockImplementation((id: string) => of({ legalName: id, alias: '' }));
    balanceApi.getBalance.mockReturnValueOnce(firstBalance).mockReturnValueOnce(secondBalance);
    balanceApi.getTransactions.mockReturnValue(of({ content: [] }));
    invoiceApi.getAll.mockReturnValue(of([]));
    receivablesApi.getCustomerPaymentHistory.mockReturnValue(of({ content: [] }));
    creditNoteApi.getAll.mockReturnValue(of([]));
    debitNoteApi.getAll.mockReturnValue(of([]));
    returnApi.getAll.mockReturnValue(of([]));
    fixture.detectChanges();
    const component = fixture.componentInstance;
    component.filterNumber.set('previous-filter');
    component.applyFilters();
    routeParams.next(convertToParamMap({ id: 'customer-002' }));
    expect(balanceApi.getBalance).toHaveBeenLastCalledWith('customer-002');
    expect(component.activeFilterCount()).toBe(0);
    secondBalance.next({
      customerId: 'customer-002',
      totalBalance: 20,
      createdAt: null,
      updatedAt: null,
    });
    secondBalance.complete();
    firstBalance.next({
      customerId: 'customer-001',
      totalBalance: 100,
      createdAt: null,
      updatedAt: null,
    });
    firstBalance.complete();
    expect(component.balance()?.customerId).toBe('customer-002');
    expect(component.customerName()).toBe('customer-002');
    expect(component.transactionsLoading()).toBe(false);
  });

  it('keeps the balance workspace visible while its requests are loading', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Saldo del Cliente');
    expect(fixture.nativeElement.textContent).toContain('Historial de Movimientos');
    expect(fixture.componentInstance.transactionsLoading()).toBe(true);

    const backButton = Array.from<HTMLButtonElement>(
      fixture.nativeElement.querySelectorAll('button'),
    ).find((button) => button.textContent?.includes('Volver'));
    expect(backButton?.className).toContain('bg-surface-900');
    expect(backButton?.className).toContain('dark:!bg-surface-100');
    expect(backButton?.className).toContain('w-full');
    expect(backButton?.className).toContain('sm:w-auto');

    const filterPopover = fixture.debugElement.query(By.directive(Popover))
      .componentInstance as Popover;
    expect(filterPopover.focusOnShow).toBe(false);

    const filterButton = Array.from<HTMLButtonElement>(
      fixture.nativeElement.querySelectorAll('button'),
    ).find((button) => button.getAttribute('aria-label') === 'Filtros');
    expect(filterButton?.parentElement?.className).toContain('shrink-0');
  });

  it('shows an empty balance when the customer has no balance record', () => {
    customerApi.getById.mockReturnValue(
      of({ legalName: 'Cliente sin movimientos', alias: 'Nuevo' }),
    );
    balanceApi.getBalance.mockReturnValue(
      of({
        customerId: 'customer-001',
        totalBalance: 0,
        createdAt: null,
        updatedAt: null,
      }),
    );
    balanceApi.getTransactions.mockReturnValue(
      of({
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: 10,
        number: 0,
        first: true,
        last: true,
        empty: true,
      }),
    );
    invoiceApi.getAll.mockReturnValue(of([]));
    receivablesApi.getCustomerPaymentHistory.mockReturnValue(of({ content: [], totalElements: 0 }));
    creditNoteApi.getAll.mockReturnValue(of([]));
    debitNoteApi.getAll.mockReturnValue(of([]));
    returnApi.getAll.mockReturnValue(of([]));

    fixture.detectChanges();

    const emptyText = fixture.nativeElement.textContent.replace(/\u00a0/g, ' ');
    expect(emptyText).toContain('Cliente sin movimientos');
    expect(emptyText).toContain('0,00$');
    expect(fixture.nativeElement.textContent).toContain('No se encontraron movimientos');
  });

  it('builds the account statement from every financial document of the customer', () => {
    customerApi.getById.mockReturnValue(of({ legalName: 'Cliente con actividad', alias: '' }));
    balanceApi.getBalance.mockReturnValue(
      of({ customerId: 'customer-001', totalBalance: 30, createdAt: null, updatedAt: null }),
    );
    balanceApi.getTransactions.mockReturnValue(
      of({
        content: [
          {
            id: 'advance-1',
            customerId: 'customer-001',
            type: 'ADVANCED',
            amount: 30,
            referenceType: 'ADVANCED',
            referenceId: null,
            number: 'ANT-001',
            referenceNumber: null,
            createdBy: 'user-1',
            createdAt: '2026-08-10T09:00:00',
          },
        ],
        totalElements: 1,
        totalPages: 1,
        size: 100,
        number: 0,
        first: true,
        last: true,
        empty: false,
      }),
    );
    invoiceApi.getAll.mockReturnValue(
      of([
        {
          id: 'invoice-1',
          invoiceNumber: 'INV-001',
          customerId: 'customer-001',
          customerName: 'Cliente con actividad',
          status: InvoiceStatus.PARTIALLY_PAID,
          statusLabel: 'Parcialmente Pagada',
          paymentType: PaymentType.CREDIT,
          subtotal: 1000,
          total: 925,
          paidAmount: 200,
          creditApplied: 100,
          debitApplied: 50,
          lineCount: 1,
          orderId: null,
          orderNumber: null,
          createdAt: '2026-08-01T09:00:00',
          returnStatus: 'PARTIAL',
        },
      ]),
    );
    receivablesApi.getCustomerPaymentHistory.mockReturnValue(
      of({
        content: [
          {
            id: 'payment-1',
            paymentNumber: 'PAY-001',
            customerId: 'customer-001',
            customerName: 'Cliente con actividad',
            amount: 200,
            paymentMethodName: 'Efectivo',
            status: 'APPLIED',
            source: 'PAYMENT_METHOD',
            paymentDate: '2026-08-02',
            createdAt: '2026-08-02T09:00:00',
            invoiceNumber: 'INV-001',
            voucherUrl: null,
          },
        ],
        totalElements: 1,
      }),
    );
    creditNoteApi.getAll.mockReturnValue(
      of([
        {
          id: 'credit-1',
          noteNumber: 'CN-001',
          customerName: 'Cliente con actividad',
          invoiceNumber: 'INV-001',
          amount: 100,
          reason: 'Ajuste',
          createdByName: 'Admin',
          createdAt: '2026-08-03T09:00:00',
        },
      ]),
    );
    debitNoteApi.getAll.mockReturnValue(
      of([
        {
          id: 'debit-1',
          noteNumber: 'DN-001',
          customerId: 'customer-001',
          customerName: 'Cliente con actividad',
          invoiceNumber: 'INV-001',
          amount: 50,
          createdAt: '2026-08-04T09:00:00',
        },
      ]),
    );
    returnApi.getAll.mockReturnValue(
      of([
        {
          id: 'return-1',
          returnNumber: 'DEV-001',
          customerName: 'Cliente con actividad',
          invoiceNumber: 'INV-001',
          returnType: 'MANUAL',
          totalAmount: 25,
          reason: 'Devolución',
          createdByName: 'Admin',
          createdAt: '2026-08-05T09:00:00',
        },
      ]),
    );

    fixture.detectChanges();

    const renderedText = fixture.nativeElement.textContent.replace(/\u00a0/g, ' ');
    expect(renderedText).toContain('725,00$');
    expect(renderedText).toContain('30,00$');
    expect(renderedText).toContain('INV-001');
    expect(renderedText).toContain('PAY-001');
    expect(renderedText).toContain('CN-001');
    expect(renderedText).toContain('DN-001');
    expect(renderedText).toContain('DEV-001');
    expect(renderedText).toContain('ANT-001');
  });

  it('filters movements by date, type, number, reference and amount', () => {
    customerApi.getById.mockReturnValue(of({ legalName: 'Cliente con actividad', alias: '' }));
    balanceApi.getBalance.mockReturnValue(
      of({ customerId: 'customer-001', totalBalance: 30, createdAt: null, updatedAt: null }),
    );
    balanceApi.getTransactions.mockReturnValue(
      of({
        content: [
          {
            id: 'advance-1',
            customerId: 'customer-001',
            type: 'ADVANCED',
            amount: 30,
            referenceType: 'ADVANCED',
            referenceId: null,
            number: 'ANT-001',
            referenceNumber: 'REF-ALFA',
            createdBy: 'user-1',
            createdAt: '2026-08-10T09:00:00',
          },
          {
            id: 'refund-1',
            customerId: 'customer-001',
            type: 'REFUND',
            amount: -50,
            referenceType: 'REFUND',
            referenceId: null,
            number: 'REE-002',
            referenceNumber: 'REF-BETA',
            createdBy: 'user-1',
            createdAt: '2026-08-12T09:00:00',
          },
        ],
        totalElements: 2,
        totalPages: 1,
        size: 100,
        number: 0,
        first: true,
        last: true,
        empty: false,
      }),
    );
    invoiceApi.getAll.mockReturnValue(of([]));
    receivablesApi.getCustomerPaymentHistory.mockReturnValue(of({ content: [], totalElements: 0 }));
    creditNoteApi.getAll.mockReturnValue(of([]));
    debitNoteApi.getAll.mockReturnValue(of([]));
    returnApi.getAll.mockReturnValue(of([]));

    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.filterDateFrom.set(new Date(2026, 7, 10));
    component.filterDateTo.set(new Date(2026, 7, 10));
    component.filterType.set('ADVANCED');
    component.filterNumber.set('ant-001');
    component.filterReference.set('alfa');
    component.filterAmount.set(30);
    component.applyFilters();
    fixture.detectChanges();

    expect(component.activeFilterCount()).toBe(6);
    expect(component.totalRecords()).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('ANT-001');
    expect(fixture.nativeElement.textContent).not.toContain('REE-002');

    component.clearFilters();
    fixture.detectChanges();

    expect(component.activeFilterCount()).toBe(0);
    expect(component.totalRecords()).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('REE-002');
  });
});
