import { Injectable, Injector, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  ListNavigationService,
  NavigationRecord,
} from '@shared/components/list/list-navigation.service';
import {
  loadNavigationLookup,
  NavigationLookupItem,
} from '@shared/components/list/list-navigation-data-source';
import { LIST_NAVIGATION_DEFINITIONS } from '../config/list-navigation.config';
import {
  lookupFilterDefaults,
  lookupFilterDefinitions,
  LookupFilterOption,
} from '../config/list-navigation-filters';
import { moduleForUrl } from '@features/platform/auth/authorization/models/permission-context';
import { CategoryApiService } from '@features/catalog/categories/services/api/category-api.service';
import { AccessManagementService } from '@features/platform/auth/authorization/services/access-management.service';
import { TranslationService } from '@core/i18n/translation.service';
import { MessageService } from 'primeng/api';
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
import { PdfViewerService } from '@core/pdf-viewer/services';

const RECORD_PATH_SEGMENTS: Record<string, readonly string[]> = {
  'Ver detalle': [],
  Editar: ['edit'],
};

const RECEIVABLES_ACTIONS: readonly string[] = [
  'Ver deuda',
  'Pagar todo',
  'Pago parcial',
  'Reintegro',
  'Generar anticipo',
];

function receivablesActionKind(label: string): ReceivablesActionKind {
  switch (label) {
    case 'Ver deuda':
      return 'view';
    case 'Pagar todo':
      return 'pay_all';
    case 'Pago parcial':
      return 'pay_partial';
    case 'Reintegro':
      return 'refund';
    case 'Generar anticipo':
      return 'advance';
    default:
      return 'view';
  }
}

function invoiceActionKind(label: string): InvoiceActionKind {
  switch (label) {
    case 'Confirmar':
      return 'confirm';
    case 'Cancelar':
      return 'cancel';
    case 'Duplicar':
      return 'duplicate';
    default:
      return 'confirm';
  }
}

function cashRegisterActionKind(label: string): CashRegisterActionKind {
  switch (label) {
    case 'Abrir caja':
      return 'open';
    case 'Cerrar caja':
      return 'close';
    case 'Ver detalles':
      return 'detail';
    default:
      return 'detail';
  }
}

@Injectable({ providedIn: 'root' })
export class NavigationLookupService {
  private readonly injector = inject(Injector);
  private readonly router = inject(Router);
  private readonly navigation = inject(ListNavigationService);
  private readonly translations = inject(TranslationService);
  private readonly messages = inject(MessageService);
  private readonly documentActions = inject(DocumentActionDialogService);
  private readonly receivablesActions = inject(ReceivablesActionDialogService);
  private readonly invoiceActions = inject(InvoiceActionDialogService);
  private readonly warehouseActions = inject(WarehouseActionDialogService);
  private readonly cashRegisterActions = inject(CashRegisterActionDialogService);
  private readonly pendingPaymentActions = inject(PendingPaymentActionDialogService);
  private readonly pdfViewer = inject(PdfViewerService);

  open(route: string, label: string, queryParams?: Record<string, string>): void {
    const definition = LIST_NAVIGATION_DEFINITIONS.find((item) => item.route === route);
    const destinationItem = definition?.destinations?.find((item) => item.label === label);
    if (destinationItem?.routerLink) {
      const destinationModule = destinationItem.requiredModule ?? null;
      if (
        !this.navigation.allowed(
          {
            label,
            icon: destinationItem.icon,
            requiredAction: destinationItem.requiredAction ?? 'READ',
            command: () => undefined,
          },
          destinationModule,
        )
      )
        return;
      this.navigation.dismiss();
      void this.router.navigate([destinationItem.routerLink], { queryParams });
      return;
    }
    const definitionAction = definition?.actions.find((item) => item.label === label);
    const module = moduleForUrl(route);
    if (!definitionAction || !module) return;
    const permission = { ...definitionAction, command: () => undefined };
    if (!this.navigation.allowed(permission, module)) return;
    this.navigation.dismiss();
    if (route === '/finance/treasury/cash-register') {
      this.cashRegisterActions.open({ action: cashRegisterActionKind(label) });
      return;
    }
    const items = signal<NavigationLookupItem[]>([]);
    const loading = signal(false);
    const total = signal(0);
    const first = signal(0);
    const rows = signal(10);
    const filterValues = signal(lookupFilterDefaults(route));
    const filterSources: {
      values: Record<string, string>;
      categories: LookupFilterOption[];
      roles: LookupFilterOption[];
    } = {
      values: filterValues(),
      categories: [] as LookupFilterOption[],
      roles: [] as LookupFilterOption[],
    };
    const filters = () =>
      lookupFilterDefinitions(route, { ...filterSources, values: filterValues() }).map(
        (filter) => ({
          label: filter.label,
          value: filterValues()[filter.key] ?? filter.defaultValue,
          options: [...filter.options],
          change: (value: string) => {
            filterValues.update((values) => ({ ...values, [filter.key]: value }));
            first.set(0);
            load();
          },
        }),
      );
    let search = '';
    let request: Subscription | undefined;
    const owner = {};
    const modalAction =
      (route === '/sales/orders' &&
        ['Confirmar', 'Convertir a factura', 'Cancelar'].includes(label)) ||
      (route === '/sales/quotes' &&
        ['Convertir a pedido', 'Convertir a factura'].includes(label)) ||
      (route === '/procurement/purchases' &&
        ['Confirmar compra', 'Cancelar compra'].includes(label));
    const pdfAction = label === 'Descargar PDF';
    const receivablesAction =
      route === '/finance/treasury/receivables' && RECEIVABLES_ACTIONS.includes(label);
    const invoiceAction =
      route === '/finance/billing/invoices' &&
      ['Confirmar', 'Cancelar', 'Duplicar'].includes(label);
    const warehouseAction =
      route === '/inventory/warehouses' &&
      ['Registrar entrada', 'Registrar salida'].includes(label);
    const pendingPaymentAction =
      route === '/finance/treasury/receivables' &&
      ['Aprobar pago', 'Rechazar pago'].includes(label);
    const records = computed<NavigationRecord[]>(() =>
      items().map((item) => ({
        key: item.id,
        label: item.label,
        description: item.description,
        action: () => ({
          ...definitionAction,
          command: () => {
            if (modalAction) {
              this.documentActions.open({
                route: route as '/sales/quotes' | '/sales/orders' | '/procurement/purchases',
                label,
                recordId: item.id,
                recordLabel: item.label,
              });
              return;
            }
            if (pdfAction) {
              this.openRecordPdf(route, item.id, item.label);
              return;
            }
            const recordPath = RECORD_PATH_SEGMENTS[label];
            if (recordPath) {
              void this.router.navigate([route, item.id, ...recordPath], { queryParams });
              return;
            }
            if (receivablesAction) {
              this.receivablesActions.open({
                customerId: item.id,
                customerName: item.label,
                action: receivablesActionKind(label),
              });
              return;
            }
            if (invoiceAction) {
              this.invoiceActions.open({
                invoiceId: item.id,
                invoiceNumber: item.label,
                action: invoiceActionKind(label),
              });
              return;
            }
            if (warehouseAction) {
              this.warehouseActions.open({
                warehouseId: item.id,
                warehouseName: item.label,
                operation: label === 'Registrar entrada' ? 'entry' : 'exit',
              });
              return;
            }
            if (pendingPaymentAction) {
              this.pendingPaymentActions.open({
                paymentId: item.id,
                action: label === 'Aprobar pago' ? 'approve' : 'reject',
              });
              return;
            }
            void this.router.navigate([route], {
              queryParams: {
                ...queryParams,
                navAction: label,
                navRecord: item.id,
                navSearch: item.label,
              },
            });
          },
        }),
      })),
    );
    const load = () => {
      request?.unsubscribe();
      loading.set(true);
      const source = loadNavigationLookup(
        this.injector,
        route,
        label,
        search,
        Math.floor(first() / rows()),
        rows(),
        filterValues(),
      );
      request = source.subscribe({
        next: (result) => {
          items.set(result.items);
          total.set(result.total);
          loading.set(false);
        },
        error: () => {
          items.set([]);
          total.set(0);
          loading.set(false);
          this.messages.add({
            severity: 'error',
            summary: label,
            detail: 'No se pudieron cargar los registros. Intente buscar de nuevo.',
          });
        },
      });
    };
    if (route === '/catalog/products') {
      this.injector
        .get(CategoryApiService)
        .getAll({ active: true, page: 0, size: 1000 })
        .subscribe({
          next: (response) => {
            filterSources.categories = response.content.map((category) => ({
              label: category.name,
              value: category.id,
            }));
          },
          error: () => undefined,
        });
    }
    if (route === '/platform/users') {
      this.injector
        .get(AccessManagementService)
        .roleOptions()
        .subscribe({
          next: (roles) => {
            filterSources.roles = roles.map((role) => ({ label: role.name, value: role.id }));
          },
          error: () => undefined,
        });
    }
    this.navigation.session.set({
      owner,
      title: label,
      module,
      records,
      filters,
      loading,
      total,
      first,
      rows,
      search: (term) => {
        search = term;
        first.set(0);
        load();
      },
      paginate: (event) => {
        first.set(event.first);
        rows.set(event.rows);
        load();
      },
      onClose: () => request?.unsubscribe(),
    });
    load();
  }

  private openRecordPdf(route: string, id: string, recordLabel: string): void {
    const configuration: Record<string, { url: string; title: string; fileName: string }> = {
      '/sales/quotes': {
        url: `/api/reports/quotes/${id}/pdf`,
        title: `Presupuesto ${recordLabel}`,
        fileName: `presupuesto-${recordLabel}.pdf`,
      },
      '/sales/orders': {
        url: `/api/reports/orders/${id}/pdf`,
        title: `Pedido ${recordLabel}`,
        fileName: `pedido-${recordLabel}.pdf`,
      },
      '/procurement/purchases': {
        url: `/api/reports/purchases/${id}/pdf`,
        title: `Compra ${recordLabel}`,
        fileName: `compra-${recordLabel}.pdf`,
      },
      '/finance/billing/invoices': {
        url: `/api/reports/invoices/${id}/pdf`,
        title: `Factura ${recordLabel}`,
        fileName: `factura-${recordLabel}.pdf`,
      },
    };
    const selected = configuration[route];
    if (!selected) return;
    this.pdfViewer.open(selected);
  }
}
