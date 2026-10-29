import { MenuItem } from '@core/layouts/models';
import { PermissionAction } from '@features/platform/auth/authorization/models/access.model';
import { moduleForUrl } from '@features/platform/auth/authorization/models/permission-context';

export interface NavigationActionDefinition {
  label: string;
  requiredAction: PermissionAction;
  icon: string;
  requiredPermissions?: string[];
  queryParams?: Record<string, string>;
}

export interface ListNavigationDefinition {
  route: string;
  singular: string;
  create?: boolean;
  createPermissions?: string[];
  actions: NavigationActionDefinition[];
  destinations?: MenuItem[];
}

const action = (
  label: string,
  requiredAction: PermissionAction,
  icon: string,
  requiredPermissions?: string[],
): NavigationActionDefinition => ({
  label,
  requiredAction,
  icon: `pi pi-${icon}`,
  ...(requiredPermissions ? { requiredPermissions } : {}),
});
const view = (permissions?: string[]) => action('Ver detalle', 'READ', 'eye', permissions);
const edit = (permissions?: string[]) => action('Editar', 'UPDATE', 'pencil', permissions);
const pdf = () => action('Descargar PDF', 'EXPORT', 'file-pdf');
const recordActions = () => [view(), edit()];
const inventoryRead = ['INVENTORY:READ'];
const inventoryExecute = ['INVENTORY:EXECUTE'];

export const LIST_NAVIGATION_DEFINITIONS: ListNavigationDefinition[] = [
  {
    route: '/sales/quotes',
    singular: 'presupuesto',
    create: true,
    createPermissions: inventoryRead,
    actions: [
      view(inventoryRead),
      pdf(),
      edit(inventoryRead),
      action('Convertir a pedido', 'EXECUTE', 'shopping-cart', [
        'SALES:CREATE',
        ...inventoryExecute,
      ]),
      action('Convertir a factura', 'EXECUTE', 'file', ['FINANCES:CREATE', ...inventoryExecute]),
    ],
  },
  {
    route: '/sales/orders',
    singular: 'pedido',
    create: true,
    createPermissions: inventoryExecute,
    actions: [
      view(inventoryRead),
      pdf(),
      edit(inventoryExecute),
      action('Confirmar', 'EXECUTE', 'check', inventoryExecute),
      action('Convertir a factura', 'EXECUTE', 'file', ['FINANCES:CREATE', ...inventoryExecute]),
      action('Cancelar', 'EXECUTE', 'times', inventoryExecute),
    ],
  },
  {
    route: '/procurement/purchases',
    singular: 'compra',
    create: true,
    createPermissions: inventoryRead,
    actions: [
      view(inventoryRead),
      pdf(),
      edit(inventoryRead),
      action('Confirmar compra', 'EXECUTE', 'check', inventoryExecute),
      action('Cancelar compra', 'EXECUTE', 'ban', inventoryExecute),
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
      {
        label: 'Ver stock',
        icon: 'pi pi-box',
        routerLink: '/inventory/warehouses/stock',
        requiredAction: 'READ',
      },
    ],
    actions: [
      action('Registrar entrada', 'EXECUTE', 'arrow-circle-down'),
      action('Registrar salida', 'EXECUTE', 'arrow-circle-up'),
      action('Historial de movimientos', 'READ', 'history'),
      ...recordActions(),
    ],
  },
  {
    route: '/finance/billing/invoices',
    singular: 'factura',
    create: true,
    createPermissions: inventoryExecute,
    actions: [
      view(inventoryRead),
      pdf(),
      action('Confirmar', 'EXECUTE', 'check', inventoryExecute),
      edit(inventoryExecute),
      action('Cancelar', 'EXECUTE', 'times', inventoryExecute),
      action('Duplicar', 'CREATE', 'copy', inventoryExecute),
    ],
  },
  {
    route: '/finance/billing/returns',
    singular: 'devolución',
    create: true,
    createPermissions: inventoryExecute,
    actions: [view()],
  },
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
    actions: [view(), edit(), action('Ver saldo', 'READ', 'wallet', ['FINANCES:READ'])],
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
      action('Ver deuda', 'READ', 'eye'),
      action('Pagar todo', 'EXECUTE', 'check-circle'),
      action('Pago parcial', 'EXECUTE', 'percentage'),
      action('Reintegro', 'EXECUTE', 'undo'),
      action('Generar anticipo', 'EXECUTE', 'plus-circle'),
      ...['Aprobar pago', 'Rechazar pago'].map((label) => ({
        ...action(label, 'EXECUTE', label === 'Aprobar pago' ? 'check' : 'times'),
        queryParams: { tab: 'pending' },
      })),
    ],
  },
  {
    route: '/finance/treasury/cash-register',
    singular: 'caja',
    actions: [
      action('Abrir caja', 'EXECUTE', 'lock-open'),
      action('Cerrar caja', 'EXECUTE', 'lock'),
      action('Ver detalles', 'READ', 'eye'),
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
                requiredPermissions: definition.createPermissions,
              },
            ]
          : []),
        ...(children ?? []),
        ...(definition.destinations ?? []).map((destination) => ({
          ...destination,
          requiredModule: module,
        })),
        ...definition.actions.map(
          (entry): MenuItem => ({
            label: actionLabel(entry.label, definition.singular),
            icon: entry.icon,
            requiredModule: module,
            requiredAction: entry.requiredAction,
            requiredPermissions: entry.requiredPermissions,
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
