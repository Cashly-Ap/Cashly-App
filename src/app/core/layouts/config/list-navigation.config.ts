import { MenuItem } from '@core/layouts/models';
import { PermissionAction } from '@features/platform/auth/authorization/models/access.model';
import { moduleForUrl } from '@features/platform/auth/authorization/models/permission-context';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';

export interface NavigationActionDefinition {
  label: string;
  requiredAction: PermissionAction;
  icon: string;
  module?: BusinessModule;
  queryParams?: Record<string, string>;
}

export interface ListNavigationDefinition {
  route: string;
  singular: string;
  create?: boolean;
  actions: NavigationActionDefinition[];
  destinations?: MenuItem[];
}

const action = (
  label: string,
  requiredAction: PermissionAction,
  icon: string,
  module?: BusinessModule,
): NavigationActionDefinition => ({
  label,
  requiredAction,
  icon: `pi pi-${icon}`,
  ...(module ? { module } : {}),
});
const view = () => action('Ver detalle', 'READ', 'eye');
const edit = () => action('Editar', 'UPDATE', 'pencil');
const pdf = () => action('Descargar PDF', 'EXPORT', 'file-pdf');
const recordActions = () => [view(), edit()];
const destination = (
  label: string,
  routerLink: string,
  requiredAction: PermissionAction,
  icon: string,
  module: BusinessModule,
): MenuItem => ({ label, icon: `pi pi-${icon}`, routerLink, requiredAction, requiredModule: module });

export const LIST_NAVIGATION_DEFINITIONS: ListNavigationDefinition[] = [
  {
    route: '/sales/quotes',
    singular: 'presupuesto',
    create: true,
    actions: [
      view(),
      pdf(),
      edit(),
      action('Convertir a pedido', 'CREATE', 'shopping-cart', BusinessModule.SALES_ORDERS),
      action('Convertir a factura', 'CREATE', 'file', BusinessModule.FINANCE_INVOICES),
    ],
  },
  {
    route: '/sales/orders',
    singular: 'pedido',
    create: true,
    actions: [
      view(),
      pdf(),
      edit(),
       action('Confirmar', 'CONFIRM', 'check', BusinessModule.FINANCE_INVOICES),
      action('Convertir a factura', 'CREATE', 'file', BusinessModule.FINANCE_INVOICES),
       action('Cancelar', 'CANCEL', 'times', BusinessModule.FINANCE_INVOICES),
    ],
  },
  {
    route: '/procurement/purchases',
    singular: 'compra',
    create: true,
    actions: [
      view(),
      pdf(),
      edit(),
      action('Confirmar compra', 'CONFIRM', 'check'),
      action('Cancelar compra', 'CANCEL', 'ban'),
    ],
  },
  { route: '/catalog/products', singular: 'producto', create: true, actions: recordActions() },
  { route: '/catalog/categories', singular: 'categoría', create: true, actions: recordActions() },
  {
    route: '/catalog/price-types',
    singular: 'tipo de precio',
    create: true,
    actions: recordActions(),
  },
  {
    route: '/inventory/warehouses',
    singular: 'almacén',
    create: true,
    destinations: [
      destination(
        'Ver stock',
        '/inventory/warehouses/stock',
        'READ',
        'box',
         BusinessModule.INVENTORY_WAREHOUSES,
      ),
      destination(
        'Historial de movimientos',
        '/inventory/warehouses/movements',
        'READ',
        'history',
         BusinessModule.INVENTORY_WAREHOUSES,
      ),
    ],
    actions: [
        action('Registrar entrada', 'EXECUTE', 'arrow-circle-down', BusinessModule.INVENTORY_WAREHOUSES),
        action('Registrar salida', 'EXECUTE', 'arrow-circle-up', BusinessModule.INVENTORY_WAREHOUSES),
      ...recordActions(),
    ],
  },
  {
    route: '/finance/billing/invoices',
    singular: 'factura',
    create: true,
    actions: [
      view(),
      pdf(),
       action('Confirmar', 'CONFIRM', 'check', BusinessModule.FINANCE_INVOICES),
      edit(),
       action('Cancelar', 'CANCEL', 'times', BusinessModule.FINANCE_INVOICES),
        action('Duplicar', 'INVOICE_DUPLICATE', 'copy', BusinessModule.FINANCE_INVOICES),
    ],
  },
  { route: '/finance/billing/returns', singular: 'devolución', create: true, actions: [view()] },
  {
    route: '/finance/billing/credit-notes',
    singular: 'nota de crédito',
    create: true,
    actions: [view()],
  },
  {
    route: '/finance/billing/debit-notes',
    singular: 'nota de débito',
    create: true,
    actions: [view()],
  },
  {
    route: '/finance/treasury/payment-methods',
    singular: 'método de pago',
    create: true,
    actions: recordActions(),
  },
  {
    route: '/partners/customers',
    singular: 'cliente',
    create: true,
    actions: [
      view(),
      edit(),
        action('Ver saldo', 'CUSTOMER_BALANCE', 'wallet', BusinessModule.CONTACTS_CUSTOMERS),
    ],
  },
  { route: '/partners/suppliers', singular: 'proveedor', create: true, actions: recordActions() },
  { route: '/platform/users', singular: 'usuario', create: true, actions: recordActions() },
  { route: '/platform/roles', singular: 'rol', create: true, actions: recordActions() },
  {
    route: '/platform/departments',
    singular: 'departamento',
    create: true,
    actions: recordActions(),
  },
  {
    route: '/finance/treasury/receivables',
    singular: 'cliente',
    actions: [
        action('Ver deuda', 'DETAILS', 'eye', BusinessModule.FINANCE_RECEIVABLES),
        action('Pagar todo', 'PAY_ALL', 'check-circle', BusinessModule.FINANCE_RECEIVABLES),
        action('Pago parcial', 'PARTIAL_PAYMENT', 'percentage', BusinessModule.FINANCE_RECEIVABLES),
        action('Reintegro', 'REFUND', 'undo', BusinessModule.FINANCE_RECEIVABLES),
        action('Generar anticipo', 'ADVANCE', 'plus-circle', BusinessModule.FINANCE_RECEIVABLES),
        ...['Aprobar pago', 'Rechazar pago'].map((label) => ({
          ...action(label, label === 'Aprobar pago' ? 'APPROVE_PAYMENT' : 'REJECT_PAYMENT', label === 'Aprobar pago' ? 'check' : 'times', BusinessModule.FINANCE_RECEIVABLES),
        queryParams: { tab: 'pending' },
      })),
    ],
  },
  {
    route: '/finance/treasury/cash-register',
    singular: 'caja',
    actions: [
        action('Abrir caja', 'OPEN', 'lock-open', BusinessModule.FINANCE_CASH_REGISTER),
        action('Cerrar caja', 'CLOSE', 'lock', BusinessModule.FINANCE_CASH_REGISTER),
        action('Ver detalles', 'DETAILS', 'eye', BusinessModule.FINANCE_CASH_REGISTER),
    ],
  },
];

export interface ListNavigationCallbacks {
  openListAction: (route: string, action: string, queryParams?: Record<string, string>) => void;
  openCustomerEditPicker: () => void;
  openCustomerBalancePicker: () => void;
}

function actionLabel(action: string, singular: string): string {
  if (action === 'Ver detalle') return `Ver detalle de ${singular}`;
  if (action === 'Ver saldo') return `Ver saldo de ${singular}`;
  if (['Editar', 'Confirmar', 'Cancelar', 'Duplicar'].includes(action))
    return `${action} ${singular}`;
  if (action === 'Descargar PDF') return `Descargar PDF de ${singular}`;
  return action;
}

function actionOrder(item: MenuItem): number {
  if (/^Ver detalle|^Ver detalles|^Ver deuda/.test(item.label)) return 0;
  if (item.requiredAction === 'UPDATE') return 1;
  if (item.requiredAction === 'DELETE') return 2;
  if (item.routerLink?.endsWith('/new')) return 3;
  if (
    (item.requiredAction === 'EXPORT' && !item.label.startsWith('Descargar PDF')) ||
    item.label === 'Reportes'
  )
    return 5;
  return 4;
}

export function addListNavigationActions(
  items: MenuItem[],
  callbacks: ListNavigationCallbacks,
): MenuItem[] {
  return items.map((item) => {
    const definition = LIST_NAVIGATION_DEFINITIONS.find((entry) => entry.route === item.routerLink);
    if (!definition)
      return item.children
        ? { ...item, children: addListNavigationActions(item.children, callbacks) }
        : item;
    const module = moduleForUrl(definition.route) ?? undefined;
    const { routerLink, children, ...group } = item;
    return {
      ...group,
      requiredModule: module,
      children: [
        {
          ...group,
          routerLink,
          label: `Ver ${item.label.toLocaleLowerCase()}`,
          requiredModule: module,
        },
        ...(definition.create
          ? [
              {
                label: `Crear ${definition.singular}`,
                icon: 'pi pi-plus',
                routerLink: `${routerLink}/new`,
                requiredModule: module,
                requiredAction: 'CREATE' as const,
              },
            ]
          : []),
        ...(children ?? []),
        ...(definition.destinations ?? []),
        ...definition.actions.map(
          (entry): MenuItem => ({
            label: actionLabel(entry.label, definition.singular),
            icon: entry.icon,
            requiredModule: entry.module ?? module,
            requiredAction: entry.requiredAction,
            command:
              definition.route === '/partners/customers' && entry.label === 'Editar'
                ? callbacks.openCustomerEditPicker
                : definition.route === '/partners/customers' && entry.label === 'Ver saldo'
                  ? callbacks.openCustomerBalancePicker
                  : () =>
                      callbacks.openListAction(definition.route, entry.label, entry.queryParams),
          }),
        ),
      ]
        .map((child, index) => ({ child, order: index === 0 ? -1 : actionOrder(child) }))
        .sort((left, right) => left.order - right.order)
        .map(({ child }) => child),
    };
  });
}
