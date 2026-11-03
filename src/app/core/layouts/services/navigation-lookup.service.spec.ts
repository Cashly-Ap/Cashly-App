import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CategoryApiService } from '@features/catalog/categories/services/api/category-api.service';
import { OrderApiService } from '@features/sales/orders/services/api/order-api.service';
import { QuoteApiService } from '@features/sales/quotes/services/api/quote-api.service';
import { PurchaseApiService } from '@features/procurement/purchases/services/api/purchase-api.service';
import { AuthorizationService } from '@features/platform/auth/authorization/services/authorization.service';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';
import { ListNavigationService } from '@shared/components/list/list-navigation.service';
import { DeleteDialogService } from '@shared/services/delete-dialog.service';
import { NavigationLookupService } from './navigation-lookup.service';
import { DocumentActionDialogService } from './document-action-dialog.service';
import {
  ReceivablesActionDialogService,
  ReceivablesActionKind,
} from './receivables-action-dialog.service';
import { InvoiceActionDialogService, InvoiceActionKind } from './invoice-action-dialog.service';
import { WarehouseActionDialogService } from './warehouse-action-dialog.service';
import {
  CashRegisterActionDialogService,
  CashRegisterActionKind,
} from './cash-register-action-dialog.service';
import { PendingPaymentActionDialogService } from './pending-payment-action-dialog.service';
import * as navigationDataSource from '@shared/components/list/list-navigation-data-source';
import { LIST_NAVIGATION_DEFINITIONS } from '../config/list-navigation.config';

describe('Navbar lookup without navigation', () => {
  const navigate = vi.fn().mockResolvedValue(true);
  const categoryApi = { getAll: vi.fn() };
  const orderApi = { getAll: vi.fn().mockReturnValue(of([])) };
  const quoteApi = { getAll: vi.fn().mockReturnValue(of([])) };
  const purchaseApi = { getAll: vi.fn().mockReturnValue(of([])) };
  const confirmation = { confirm: vi.fn() };
  let lookup: NavigationLookupService;
  let navigation: ListNavigationService;
  let documentActions: DocumentActionDialogService;
  let receivablesActions: ReceivablesActionDialogService;
  let invoiceActions: InvoiceActionDialogService;
  let warehouseActions: WarehouseActionDialogService;
  let cashRegisterActions: CashRegisterActionDialogService;
  let pendingPaymentActions: PendingPaymentActionDialogService;
  let deletion: DeleteDialogService;

  beforeEach(() => {
    TestBed.resetTestingModule();
    vi.restoreAllMocks();
    vi.clearAllMocks();
    orderApi.getAll.mockReturnValue(of([]));
    quoteApi.getAll.mockReturnValue(of([]));
    purchaseApi.getAll.mockReturnValue(of([]));
    categoryApi.getAll.mockReturnValue(
      of({
        content: [
          { id: 'category-1', name: 'Hardware', active: true, productCount: 0, deletable: true },
        ],
        totalElements: 11,
      }),
    );
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: { url: '/catalog/categories', navigate } },
        { provide: AuthorizationService, useValue: { can: () => true } },
        { provide: MessageService, useValue: { add: vi.fn() } },
        { provide: ConfirmationService, useValue: confirmation },
        { provide: CategoryApiService, useValue: categoryApi },
        { provide: OrderApiService, useValue: orderApi },
        { provide: QuoteApiService, useValue: quoteApi },
        { provide: PurchaseApiService, useValue: purchaseApi },
      ],
    });
    lookup = TestBed.inject(NavigationLookupService);
    navigation = TestBed.inject(ListNavigationService);
    documentActions = TestBed.inject(DocumentActionDialogService);
    receivablesActions = TestBed.inject(ReceivablesActionDialogService);
    invoiceActions = TestBed.inject(InvoiceActionDialogService);
    warehouseActions = TestBed.inject(WarehouseActionDialogService);
    cashRegisterActions = TestBed.inject(CashRegisterActionDialogService);
    pendingPaymentActions = TestBed.inject(PendingPaymentActionDialogService);
    deletion = TestBed.inject(DeleteDialogService);
  });
  it('keeps the current screen while opening, searching, paging and cancelling', () => {
    lookup.open('/catalog/categories', 'Editar');
    expect(navigation.session()?.records()[0].label).toBe('Hardware');
    const session = navigation.session()!;
    session.search('Hard');
    session.paginate({ first: 10, rows: 10 });
    expect(categoryApi.getAll).toHaveBeenLastCalledWith({
      search: 'Hard',
      page: 1,
      size: 10,
      active: true,
    });
    navigation.dismiss();
    expect(navigation.session()).toBeNull();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('continues with the accepted record only after accepting the modal', async () => {
    lookup.open('/catalog/categories', 'Editar');
    const record = navigation.session()!.records()[0];
    expect(navigate).not.toHaveBeenCalled();
    await navigation.select(record);
    expect(navigate).toHaveBeenCalledExactlyOnceWith(
      ['/catalog/categories', 'category-1', 'edit'],
      {
        queryParams: undefined,
      },
    );
  });

  it.each(
    LIST_NAVIGATION_DEFINITIONS.flatMap((definition) =>
      definition.actions
        .filter((action) => action.label === 'Ver detalle' || action.label === 'Editar')
        .map((action) => [definition.route, action.label]),
    ),
  )('navigates directly from %s to the selected %s screen', async (route, label) => {
    vi.spyOn(navigationDataSource, 'loadNavigationLookup').mockReturnValue(
      of({ items: [{ id: 'record-1', label: 'Selected record', description: '' }], total: 1 }),
    );
    lookup.open(route, label);
    expect(navigate).not.toHaveBeenCalled();

    await navigation.select(navigation.session()!.records()[0]);

    expect(navigate).toHaveBeenCalledExactlyOnceWith(
      [route, 'record-1', ...(label === 'Editar' ? ['edit'] : [])],
      { queryParams: undefined },
    );
    expect(navigation.session()).toBeNull();
  });

  it('navigates straight to the global movements history without opening a lookup session', () => {
    const loadLookup = vi.spyOn(navigationDataSource, 'loadNavigationLookup');

    lookup.open('/inventory/warehouses', 'Historial de movimientos');

    expect(loadLookup).not.toHaveBeenCalled();
    expect(navigation.session()).toBeNull();
    expect(warehouseActions.request()).toBeNull();
    expect(documentActions.request()).toBeNull();
    expect(navigate).toHaveBeenCalledExactlyOnceWith(['/inventory/warehouses/movements'], {
      queryParams: undefined,
    });
  });

  it('keeps the warehouse as an optional query filter on the global movements history', () => {
    const loadLookup = vi.spyOn(navigationDataSource, 'loadNavigationLookup');

    lookup.open('/inventory/warehouses', 'Historial de movimientos', { warehouseId: 'wh-1' });

    expect(loadLookup).not.toHaveBeenCalled();
    expect(navigation.session()).toBeNull();
    expect(navigate).toHaveBeenCalledExactlyOnceWith(['/inventory/warehouses/movements'], {
      queryParams: { warehouseId: 'wh-1' },
    });
  });

  it('preserves explicit destination query parameters without list navigation commands', async () => {
    lookup.open('/catalog/categories', 'Ver detalle', { source: 'menu' });

    await navigation.select(navigation.session()!.records()[0]);

    expect(navigate).toHaveBeenCalledExactlyOnceWith(['/catalog/categories', 'category-1'], {
      queryParams: { source: 'menu' },
    });
  });

  it('requests eligible records from the backend without loading a section', () => {
    lookup.open('/sales/orders', 'Confirmar');
    expect(orderApi.getAll).toHaveBeenCalledWith({ search: undefined, action: 'CONFIRM' });
    expect(navigate).not.toHaveBeenCalled();
  });

  it('delegates delete to the active list action without changing the current route', async () => {
    vi.spyOn(navigationDataSource, 'loadNavigationLookup').mockReturnValue(
      of({ items: [{ id: 'category-1', label: 'Hardware', description: '' }], total: 1 }),
    );
    const activeListOwner = {};
    navigation.register({
      owner: activeListOwner,
      module: BusinessModule.CATALOG_CATEGORIES,
      records: () => [{ id: 'category-1', name: 'Hardware' }],
      label: (record) => record.name,
      actions: (record) => [
        {
          label: 'Eliminar',
          icon: 'pi pi-trash',
          requiredAction: 'DELETE',
          command: () => confirmation.confirm({ record }),
        },
      ],
    });
    lookup.open('/catalog/categories', 'Eliminar');

    await navigation.select(navigation.session()!.records()[0]);

    expect(navigate).not.toHaveBeenCalled();
    expect(deletion.request()).toEqual({
      resource: 'categories',
      id: 'category-1',
      label: 'Hardware',
    });
  });

  it.each([
    ['/sales/quotes', quoteApi, 'quoteNumber', 'Eliminar'],
    ['/sales/orders', orderApi, 'orderNumber', 'Eliminar'],
    ['/procurement/purchases', purchaseApi, 'purchaseNumber', 'Eliminar'],
  ] as const)('requests all records for deleting %s with the DELETE action', (route, api, numberKey, label) => {
    api.getAll.mockReturnValue(
      of([
        {
          id: 'draft-record',
          [numberKey]: 'DOC-001',
          customerName: 'Customer',
          customerAlias: 'Customer',
          supplierName: 'Supplier',
          status: 'DRAFT',
          createdAt: '2026-01-01T00:00:00Z',
        },
        {
          id: 'confirmed-record',
          [numberKey]: 'DOC-002',
          customerName: 'Customer',
          customerAlias: 'Customer',
          supplierName: 'Supplier',
          status: 'CONFIRMED',
          createdAt: '2026-01-02T00:00:00Z',
        },
      ]),
    );

    lookup.open(route, label);

    expect(api.getAll).toHaveBeenCalledWith({ search: undefined, action: 'DELETE' });
    expect(navigation.session()!.records().map((record) => record.id)).toEqual([
      'draft-record',
      'confirmed-record',
    ]);
    expect(navigation.session()!.total()).toBe(2);
  });

  it.each([
    ['/sales/orders', 'Confirmar', 'ORD-001', orderApi],
    ['/sales/quotes', 'Convertir a pedido', 'QUO-001', quoteApi],
    ['/procurement/purchases', 'Confirmar compra', 'PUR-001', purchaseApi],
  ])('passes search terms to %s lookup', (route, label, number, api) => {
    api.getAll.mockReturnValue(
      of([
        {
          id: 'record-1',
          orderNumber: number,
          quoteNumber: number,
          purchaseNumber: number,
          customerAlias: 'Customer',
          customerName: 'Customer',
          supplierName: 'Supplier',
          status: 'DRAFT',
          createdAt: '2026-01-01T00:00:00Z',
        },
      ]),
    );
    lookup.open(route, label);
    navigation.session()!.search(number);
    expect(api.getAll).toHaveBeenLastCalledWith({ search: number, action: expect.any(String) });
  });

  it('opens confirmation actions on the current screen without routing', async () => {
    orderApi.getAll.mockReturnValue(
      of([
        {
          id: 'order-1',
          orderNumber: 'ORD-001',
          customerAlias: 'Customer',
          status: 'DRAFT',
        },
      ]),
    );
    lookup.open('/sales/orders', 'Confirmar');
    await navigation.select(navigation.session()!.records()[0]);
    expect(navigate).not.toHaveBeenCalled();
    expect(documentActions.request()).toEqual({
      route: '/sales/orders',
      label: 'Confirmar',
      recordId: 'order-1',
      recordLabel: 'ORD-001',
    });
  });

  it.each([
    ['Ver deuda', 'view'],
    ['Pagar todo', 'pay_all'],
    ['Pago parcial', 'pay_partial'],
    ['Reintegro', 'refund'],
    ['Generar anticipo', 'advance'],
  ] as const)('opens the %s action dialog without routing', async (label, action) => {
    vi.spyOn(navigationDataSource, 'loadNavigationLookup').mockReturnValue(
      of({ items: [{ id: 'customer-1', label: 'Acme', description: '' }], total: 1 }),
    );
    lookup.open('/finance/treasury/receivables', label);

    await navigation.select(navigation.session()!.records()[0]);

    expect(navigate).not.toHaveBeenCalled();
    expect(receivablesActions.request()).toEqual({
      customerId: 'customer-1',
      customerName: 'Acme',
      action: action satisfies ReceivablesActionKind,
    });
  });

  it.each([
    ['Confirmar', 'confirm'],
    ['Cancelar', 'cancel'],
    ['Duplicar', 'duplicate'],
  ] as const)('opens the invoice %s action dialog without routing', async (label, action) => {
    vi.spyOn(navigationDataSource, 'loadNavigationLookup').mockReturnValue(
      of({ items: [{ id: 'invoice-1', label: 'FAC-001', description: '' }], total: 1 }),
    );
    lookup.open('/finance/billing/invoices', label);

    await navigation.select(navigation.session()!.records()[0]);

    expect(navigate).not.toHaveBeenCalled();
    expect(invoiceActions.request()).toEqual({
      invoiceId: 'invoice-1',
      invoiceNumber: 'FAC-001',
      action: action satisfies InvoiceActionKind,
    });
  });

  it.each([
    ['Registrar entrada', 'entry'],
    ['Registrar salida', 'exit'],
  ] as const)('opens the warehouse %s action dialog without routing', async (label, operation) => {
    vi.spyOn(navigationDataSource, 'loadNavigationLookup').mockReturnValue(
      of({ items: [{ id: 'warehouse-1', label: 'Central', description: '' }], total: 1 }),
    );
    lookup.open('/inventory/warehouses', label);

    await navigation.select(navigation.session()!.records()[0]);

    expect(navigate).not.toHaveBeenCalled();
    expect(warehouseActions.request()).toEqual({
      warehouseId: 'warehouse-1',
      warehouseName: 'Central',
      operation,
    });
  });

  it.each([
    ['Abrir caja', 'open'],
    ['Cerrar caja', 'close'],
    ['Ver detalles', 'detail'],
  ] as const)(
    'opens the cash register %s action dialog without a picker or routing',
    (label, action) => {
      lookup.open('/finance/treasury/cash-register', label);

      expect(cashRegisterActions.request()).toEqual({
        action: action satisfies CashRegisterActionKind,
      });
      expect(navigation.session()).toBeNull();
      expect(navigate).not.toHaveBeenCalled();
    },
  );
  it.each([
    ['Aprobar pago', 'approve'],
    ['Rechazar pago', 'reject'],
  ] as const)('opens the %s pending payment dialog without routing', async (label, action) => {
    vi.spyOn(navigationDataSource, 'loadNavigationLookup').mockReturnValue(
      of({ items: [{ id: 'payment-1', label: 'PAY-001', description: '' }], total: 1 }),
    );
    lookup.open('/finance/treasury/receivables', label);

    await navigation.select(navigation.session()!.records()[0]);

    expect(navigate).not.toHaveBeenCalled();
    expect(navigation.session()).toBeNull();
    expect(pendingPaymentActions.request()).toEqual({
      paymentId: 'payment-1',
      action: action satisfies 'approve' | 'reject',
    });
  });
});
