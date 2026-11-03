import { MenuItem } from '@core/layouts/models';
import { PermissionAction } from '@features/platform/auth/authorization/models/access.model';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';
import { LIST_ACTION_PRESETS } from '@shared/models/list-action-presets';

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
