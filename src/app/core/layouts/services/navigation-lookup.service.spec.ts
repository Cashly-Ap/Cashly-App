import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthorizationService } from '@features/platform/auth/authorization/services/authorization.service';
import { ListNavigationService } from '@shared/components/list/list-navigation.service';
import { ActionDialogService } from '@shared/services/action-dialog.service';
import { ACTION_DIALOG_HANDLERS } from '@shared/services/action-dialog-handlers.token';
import { CancelDialogService } from '@shared/services/cancel-dialog.service';
import { CANCEL_HANDLERS } from '@shared/services/cancel-handlers.token';
import { DeleteDialogService } from '@shared/services/delete-dialog.service';
import { DELETE_HANDLERS } from '@shared/services/delete-handlers.token';
import { PDF_HANDLERS } from '@shared/services/pdf-handlers.token';
import { PdfViewerService } from '@core/pdf-viewer/services';
import { LOOKUP_DEFINITIONS } from '@shared/services/lookup-definition.token';
import { LookupDefinition } from '@core/layouts/models/lookup-definition.model';
import { NAVIGATION_ACTION_HANDLER_PROVIDERS } from '@core/navigation/providers/navigation-action-handlers.providers';
import { DIRECT_NAVIGATION_ACTION_HANDLER_PROVIDERS } from '@core/navigation/providers/direct-navigation-action-handlers.providers';
import { ReceivablesActionDialogService } from '@core/layouts/services/receivables-action-dialog.service';
import { WarehouseActionDialogService } from '@core/layouts/services/warehouse-action-dialog.service';
import { CashRegisterActionDialogService } from '@core/layouts/services/cash-register-action-dialog.service';
import { NavigationLookupService } from '@core/layouts/services/navigation-lookup.service';

@Component({ selector: 'app-test-report', standalone: true, template: '' })
class TestActionComponent {}

const definition = (route: string, id: string, label: string): LookupDefinition => ({
  route,
  load: () => of({ items: [{ id, label, description: '' }], total: 1 }),
  filters: () => [],
  recordRoutes: {
    detail: (recordId) => [route, recordId],
    edit: (recordId) => [route, recordId, 'edit'],
  },
});

describe('NavigationLookupService', () => {
  const navigate = vi.fn().mockResolvedValue(true);
  const pdfViewer = { open: vi.fn() };
  let lookup: NavigationLookupService;
  let navigation: ListNavigationService;
  let actionDialogs: ActionDialogService;
  let cancellation: CancelDialogService;
  let deletion: DeleteDialogService;
  let receivables: ReceivablesActionDialogService;
  let warehouses: WarehouseActionDialogService;
  let cashRegister: CashRegisterActionDialogService;

  beforeEach(() => {
    TestBed.resetTestingModule();
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: { url: '/sales/quotes', navigate } },
        { provide: AuthorizationService, useValue: { can: () => true } },
        { provide: MessageService, useValue: { add: vi.fn() } },
        { provide: PdfViewerService, useValue: pdfViewer },
        { provide: LOOKUP_DEFINITIONS, multi: true, useValue: definition('/sales/quotes', 'q1', 'QUO-001') },
        {
          provide: LOOKUP_DEFINITIONS,
          multi: true,
          useValue: definition('/finance/treasury/receivables', 'c1', 'Acme'),
        },
        {
          provide: LOOKUP_DEFINITIONS,
          multi: true,
          useValue: definition('/inventory/warehouses', 'w1', 'Central'),
        },
        {
          provide: ACTION_DIALOG_HANDLERS,
          multi: true,
          useValue: { resource: 'quotes', label: 'Convertir a pedido', component: TestActionComponent },
        },
        {
          provide: ACTION_DIALOG_HANDLERS,
          multi: true,
          useValue: { resource: 'quotes', label: 'Convertir a factura', component: TestActionComponent },
        },
        {
          provide: CANCEL_HANDLERS,
          multi: true,
          useValue: { resource: 'quotes', execute: vi.fn(() => of(undefined)) },
        },
        {
          provide: DELETE_HANDLERS,
          multi: true,
          useValue: { resource: 'quotes', execute: vi.fn(() => of(undefined)) },
        },
        {
          provide: PDF_HANDLERS,
          multi: true,
          useValue: { resource: 'quotes', build: () => ({ url: '/pdf', title: 'PDF' }) },
        },
        ...NAVIGATION_ACTION_HANDLER_PROVIDERS,
        ...DIRECT_NAVIGATION_ACTION_HANDLER_PROVIDERS,
      ],
    });
    lookup = TestBed.inject(NavigationLookupService);
    navigation = TestBed.inject(ListNavigationService);
    actionDialogs = TestBed.inject(ActionDialogService);
    cancellation = TestBed.inject(CancelDialogService);
    deletion = TestBed.inject(DeleteDialogService);
    receivables = TestBed.inject(ReceivablesActionDialogService);
    warehouses = TestBed.inject(WarehouseActionDialogService);
    cashRegister = TestBed.inject(CashRegisterActionDialogService);
  });

  it('opens a lookup session from the module definition', () => {
    lookup.open('/sales/quotes', 'Editar');
    expect(navigation.session()?.records()[0].label).toBe('QUO-001');
    expect(navigate).not.toHaveBeenCalled();
  });

  it('navigates to detail and edit using definition record routes', async () => {
    lookup.open('/sales/quotes', 'Ver detalle');
    await navigation.select(navigation.session()!.records()[0]);
    expect(navigate).toHaveBeenCalledWith(['/sales/quotes', 'q1'], { queryParams: undefined });

    lookup.open('/sales/quotes', 'Editar');
    await navigation.select(navigation.session()!.records()[0]);
    expect(navigate).toHaveBeenCalledWith(['/sales/quotes', 'q1', 'edit'], {
      queryParams: undefined,
    });
  });

  it('delegates delete and cancel to their dialog services', async () => {
    lookup.open('/sales/quotes', 'Eliminar');
    await navigation.select(navigation.session()!.records()[0]);
    expect(deletion.request()).toEqual({ resource: 'quotes', id: 'q1', label: 'QUO-001' });

    lookup.open('/sales/quotes', 'Cancelar');
    await navigation.select(navigation.session()!.records()[0]);
    expect(cancellation.request()).toEqual({ resource: 'quotes', id: 'q1', label: 'QUO-001' });
  });

  it('delegates PDF and conversion actions', async () => {
    lookup.open('/sales/quotes', 'Descargar PDF');
    await navigation.select(navigation.session()!.records()[0]);
    expect(pdfViewer.open).toHaveBeenCalledWith({ url: '/pdf', title: 'PDF' });

    lookup.open('/sales/quotes', 'Convertir a pedido');
    await navigation.select(navigation.session()!.records()[0]);
    expect(actionDialogs.request()?.component).toBe(TestActionComponent);
  });

  it('dispatches receivables and warehouse actions through their handlers', async () => {
    lookup.open('/finance/treasury/receivables', 'Pagar todo');
    await navigation.select(navigation.session()!.records()[0]);
    expect(receivables.request()).toEqual({
      customerId: 'c1',
      customerName: 'Acme',
      action: 'pay_all',
    });

    lookup.open('/inventory/warehouses', 'Registrar entrada');
    await navigation.select(navigation.session()!.records()[0]);
    expect(warehouses.request()).toEqual({
      warehouseId: 'w1',
      warehouseName: 'Central',
      operation: 'entry',
    });
  });

  it('runs direct actions without opening a lookup', () => {
    lookup.open('/finance/treasury/cash-register', 'Abrir caja');
    expect(navigation.session()).toBeNull();
    expect(cashRegister.request()).toEqual({ action: 'open' });
  });
});
