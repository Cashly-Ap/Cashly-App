import { MenuItem } from '@core/layouts/models';
import { PermissionAction } from '@features/platform/auth/authorization/models/access.model';
import { AppPermission } from '@features/platform/auth/permissions/app-permission';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';
import { LIST_ACTION_PRESETS } from '@shared/models/list-action-presets';
import { AuditPermission } from '@features/platform/audit/permissions';

export interface NavigationActionDefinition {
  label: string;
  requiredAction?: PermissionAction;
  requiredPermissionCode?: AppPermission;
  icon: string;
  module?: BusinessModule;
  requiredPermissions?: string[];
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
  requiredPermissions?: string[],
): NavigationActionDefinition => ({
  label,
  requiredAction,
  icon: `pi pi-${icon}`,
  ...(module ? { module } : {}),
  ...(requiredPermissions ? { requiredPermissions } : {}),
});

export const history = (): NavigationActionDefinition => ({
  label: LIST_ACTION_PRESETS.history.label,
  requiredPermissionCode: AuditPermission.VIEW_LIST,
  icon: `pi pi-${LIST_ACTION_PRESETS.history.icon}`,
});

export const view = () =>
  listAction(
    LIST_ACTION_PRESETS.view.label,
    LIST_ACTION_PRESETS.view.requiredAction,
    LIST_ACTION_PRESETS.view.icon,
  );
export const edit = () =>
  listAction(
    LIST_ACTION_PRESETS.edit.label,
    LIST_ACTION_PRESETS.edit.requiredAction,
    LIST_ACTION_PRESETS.edit.icon,
  );
export const pdf = () =>
  listAction(
    LIST_ACTION_PRESETS.pdf.label,
    LIST_ACTION_PRESETS.pdf.requiredAction,
    LIST_ACTION_PRESETS.pdf.icon,
  );
export const remove = () =>
  listAction(
    LIST_ACTION_PRESETS.remove.label,
    LIST_ACTION_PRESETS.remove.requiredAction,
    LIST_ACTION_PRESETS.remove.icon,
  );
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
