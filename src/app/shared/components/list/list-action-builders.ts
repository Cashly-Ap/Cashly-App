import { ListAction } from '@shared/components/list/list-action-buttons/list-action-buttons.component';
import { LIST_ACTION_PRESETS } from '@shared/models/list-action-presets';
import { PermissionAction } from '@features/platform/auth/authorization/models/access.model';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';

export interface ListActionOptions {
  module?: BusinessModule;
  requiredPermissions?: string[];
  danger?: boolean;
  disabled?: boolean;
}

export const listAction = (
  label: string,
  requiredAction: PermissionAction,
  icon: string,
  command: () => void,
  options: ListActionOptions = {},
): ListAction => ({
  label,
  requiredAction,
  icon: `pi pi-${icon}`,
  command,
  ...options,
});

export const viewAction = (command: () => void, options?: ListActionOptions): ListAction =>
  listAction(
    LIST_ACTION_PRESETS.view.label,
    LIST_ACTION_PRESETS.view.requiredAction,
    LIST_ACTION_PRESETS.view.icon,
    command,
    options,
  );

export const editAction = (command: () => void, options?: ListActionOptions): ListAction =>
  listAction(
    LIST_ACTION_PRESETS.edit.label,
    LIST_ACTION_PRESETS.edit.requiredAction,
    LIST_ACTION_PRESETS.edit.icon,
    command,
    options,
  );

export const pdfAction = (command: () => void, options?: ListActionOptions): ListAction =>
  listAction(
    LIST_ACTION_PRESETS.pdf.label,
    LIST_ACTION_PRESETS.pdf.requiredAction,
    LIST_ACTION_PRESETS.pdf.icon,
    command,
    options,
  );

export const deleteAction = (command: () => void, options?: ListActionOptions): ListAction =>
  listAction(
    LIST_ACTION_PRESETS.remove.label,
    LIST_ACTION_PRESETS.remove.requiredAction,
    LIST_ACTION_PRESETS.remove.icon,
    command,
    { danger: true, ...options },
  );

export const confirmAction = (
  label: string,
  command: () => void,
  options?: ListActionOptions,
): ListAction =>
  listAction(
    label,
    LIST_ACTION_PRESETS.confirm.requiredAction,
    LIST_ACTION_PRESETS.confirm.icon,
    command,
    options,
  );

export const cancelAction = (
  label: string,
  command: () => void,
  options?: ListActionOptions,
): ListAction =>
  listAction(
    label,
    LIST_ACTION_PRESETS.cancel.requiredAction,
    LIST_ACTION_PRESETS.cancel.icon,
    command,
    {
      danger: true,
      ...options,
    },
  );

export const convertToOrderAction = (
  command: () => void,
  options?: ListActionOptions,
): ListAction =>
  listAction(
    LIST_ACTION_PRESETS.convertToOrder.label,
    LIST_ACTION_PRESETS.convertToOrder.requiredAction,
    LIST_ACTION_PRESETS.convertToOrder.icon,
    command,
    { module: LIST_ACTION_PRESETS.convertToOrder.module, ...options },
  );

export const convertToInvoiceAction = (
  command: () => void,
  options?: ListActionOptions,
): ListAction =>
  listAction(
    LIST_ACTION_PRESETS.convertToInvoice.label,
    LIST_ACTION_PRESETS.convertToInvoice.requiredAction,
    LIST_ACTION_PRESETS.convertToInvoice.icon,
    command,
    { module: LIST_ACTION_PRESETS.convertToInvoice.module, ...options },
  );

export const duplicateInvoiceAction = (
  command: () => void,
  options?: ListActionOptions,
): ListAction =>
  listAction(
    LIST_ACTION_PRESETS.duplicateInvoice.label,
    LIST_ACTION_PRESETS.duplicateInvoice.requiredAction,
    LIST_ACTION_PRESETS.duplicateInvoice.icon,
    command,
    options,
  );
