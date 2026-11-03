import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';
import { PermissionAction } from '@features/platform/auth/authorization/models/access.model';

export interface ListActionPreset {
  label: string;
  requiredAction: PermissionAction;
  icon: string;
  module?: BusinessModule;
  danger?: boolean;
}

export const LIST_ACTION_PRESETS = {
  view: { label: 'Ver detalle', requiredAction: 'READ', icon: 'eye' },
  edit: { label: 'Editar', requiredAction: 'UPDATE', icon: 'pencil' },
  pdf: { label: 'Descargar PDF', requiredAction: 'EXPORT', icon: 'file-pdf' },
  remove: { label: 'Eliminar', requiredAction: 'DELETE', icon: 'trash', danger: true },
  confirm: { label: 'Confirmar', requiredAction: 'CONFIRM', icon: 'check' },
  cancel: { label: 'Cancelar', requiredAction: 'CANCEL', icon: 'times', danger: true },
  convertToOrder: {
    label: 'Convertir a pedido',
    requiredAction: 'CREATE',
    icon: 'shopping-cart',
    module: BusinessModule.SALES_ORDERS,
  },
  convertToInvoice: {
    label: 'Convertir a factura',
    requiredAction: 'CREATE',
    icon: 'file',
    module: BusinessModule.FINANCE_INVOICES,
  },
  duplicateInvoice: { label: 'Duplicar factura', requiredAction: 'CREATE', icon: 'copy' },
} satisfies Record<string, ListActionPreset>;
