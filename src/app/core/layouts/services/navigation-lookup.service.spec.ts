import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { MessageService } from 'primeng/api';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CategoryApiService } from '@features/catalog/categories/services/api/category-api.service';
import { OrderApiService } from '@features/sales/orders/services/api/order-api.service';
import { QuoteApiService } from '@features/sales/quotes/services/api/quote-api.service';
import { PurchaseApiService } from '@features/procurement/purchases/services/api/purchase-api.service';
import { AuthorizationService } from '@features/platform/auth/authorization/services/authorization.service';
import { ListNavigationService } from '@shared/components/list/list-navigation.service';
import { NavigationLookupService } from './navigation-lookup.service';
import { DocumentActionDialogService } from './document-action-dialog.service';
import * as navigationDataSource from '@shared/components/list/list-navigation-data-source';
import { LIST_NAVIGATION_DEFINITIONS } from '../config/list-navigation.config';

describe('Navbar lookup without navigation', () => {
  const navigate = vi.fn().mockResolvedValue(true);
  const categoryApi = { getAll: vi.fn() };
  const orderApi = { getAll: vi.fn().mockReturnValue(of([])) };
  const quoteApi = { getAll: vi.fn().mockReturnValue(of([])) };
  const purchaseApi = { getAll: vi.fn().mockReturnValue(of([])) };
  let lookup: NavigationLookupService;
  let navigation: ListNavigationService;
  let documentActions: DocumentActionDialogService;

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
        { provide: Router, useValue: { url: '/analytics/dashboard', navigate } },
        { provide: AuthorizationService, useValue: { can: () => true } },
        { provide: MessageService, useValue: { add: vi.fn() } },
        { provide: CategoryApiService, useValue: categoryApi },
        { provide: OrderApiService, useValue: orderApi },
        { provide: QuoteApiService, useValue: quoteApi },
        { provide: PurchaseApiService, useValue: purchaseApi },
      ],
    });
    lookup = TestBed.inject(NavigationLookupService);
    navigation = TestBed.inject(ListNavigationService);
    documentActions = TestBed.inject(DocumentActionDialogService);
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
    expect(navigate).toHaveBeenCalledExactlyOnceWith(['/catalog/categories', 'category-1', 'edit'], {
      queryParams: undefined,
    });
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
});
