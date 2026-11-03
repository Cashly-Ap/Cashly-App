import { MenuItem } from '@core/layouts/models';
import { PermissionAction } from '@features/platform/auth/authorization/models/access.model';
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

export const listAction = (
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

export const view = () => listAction('Ver detalle', 'READ', 'eye');
export const edit = () => listAction('Editar', 'UPDATE', 'pencil');
export const pdf = () => listAction('Descargar PDF', 'EXPORT', 'file-pdf');
export const remove = () => listAction('Eliminar', 'DELETE', 'trash');
export const recordActions = () => [view(), edit(), remove()];

export const destination = (
  label: string,
  routerLink: string,
  requiredAction: PermissionAction,
  icon: string,
  module: BusinessModule,
): MenuItem => ({
  label,
  icon: `pi pi-${icon}`,
  routerLink,
  requiredAction,
  requiredModule: module,
});
