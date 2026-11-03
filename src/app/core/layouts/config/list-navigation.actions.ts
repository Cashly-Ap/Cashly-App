import { MenuItem } from '@core/layouts/models';
import { moduleForUrl } from '@features/platform/auth/authorization/models/permission-context';
import { LIST_NAVIGATION_DEFINITIONS } from '@core/navigation/list-navigation.registry';

export interface ListNavigationCallbacks {
  openListAction: (route: string, action: string, queryParams?: Record<string, string>) => void;
  openCustomerEditPicker: () => void;
  openCustomerBalancePicker: () => void;
}

function actionLabel(action: string, singular: string): string {
  if (action === 'Ver detalle') return `Ver detalle de ${singular}`;
  if (action === 'Ver saldo') return `Ver saldo de ${singular}`;
  if (['Editar', 'Confirmar', 'Cancelar', 'Duplicar', 'Eliminar'].includes(action))
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
