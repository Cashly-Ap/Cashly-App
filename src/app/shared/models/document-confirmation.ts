import { PermissionAction } from '@features/platform/auth/authorization/models/access.model';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';

export type ConfirmationNoticeSeverity = 'info' | 'warning' | 'danger' | 'success';

export interface DocumentConfirmationSummaryField {
  label: string;
  value: string | number;
  monospace?: boolean;
}

export interface DocumentConfirmationInventoryRow {
  productName: string;
  productCode?: string;
  warehouseName: string;
  quantity: number;
  available: number;
  availableAfter?: number;
  sufficient: boolean;
}

export interface DocumentConfirmationModel {
  title: string;
  subtitle?: string;
  icon: string;
  summaryFields?: DocumentConfirmationSummaryField[];
  notice?: {
    severity: ConfirmationNoticeSeverity;
    title: string;
    description?: string;
  };
  inventory?: {
    rows: DocumentConfirmationInventoryRow[];
    blocking: boolean;
    emptyMessage?: string;
  };
  acceptLabel: string;
  acceptIcon?: string;
  acceptSeverity?: 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'contrast';
  cancelLabel?: string;
  permissionAction?: PermissionAction;
  permissionModule?: BusinessModule | string;
  requiredPermissions?: string[];
}
