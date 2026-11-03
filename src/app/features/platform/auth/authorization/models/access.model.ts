import { HttpContextToken } from '@angular/common/http';
export const ACCESS_REFRESH_REQUEST = new HttpContextToken<boolean>(() => false);
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';
import { AppPermission } from '@features/platform/auth/permissions/app-permission';
export type PermissionAction =
  | 'READ'
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'EXPORT'
  | 'IMPORT'
  | 'EXECUTE'
  | 'CONFIRM'
   | 'CANCEL' | 'DUPLICATE'
   | 'DETAILS' | 'BALANCE' | 'HISTORY' | 'OPEN' | 'CLOSE' | 'REPORT' | 'PARTIAL_PAYMENT' | 'REFUND' | 'ADVANCE'
   | 'CUSTOMER_BALANCE' | 'REPORT_QUOTES' | 'REPORT_ORDERS' | 'REPORT_PURCHASES' | 'REPORT_PRODUCTS'
  | 'REPORT_COMMERCIAL_CATALOG' | 'REPORT_STOCK' | 'REPORT_MOVEMENTS' | 'REPORT_INVOICES'
   | 'REPORT_CASH_REGISTER' | 'REPORT_RECEIVABLES' | 'CASH_HISTORY' | 'INVOICE_DUPLICATE'
   | 'STOCK' | 'MOVEMENT_HISTORY' | 'RECORD_ENTRY' | 'RECORD_EXIT'
  | 'PAY_WITH_VALIDATION' | 'PAY_DIRECT' | 'PAY_ALL' | 'PAY_PARTIAL' | 'APPROVE_PAYMENT' | 'REJECT_PAYMENT';
export type PermissionMatrix = Partial<Record<BusinessModule, PermissionAction[]>>;
export interface CurrentAccess {
  roleId: string;
  roleName: string;
  departmentId: string;
  systemAdministrator: boolean;
  permissions: AppPermission[];
}
export interface SelectionOption {
  id: string;
  name: string;
}
export interface Department {
  id: string;
  name: string;
  description: string;
  active: boolean;
  version: number;
}
export interface Role extends Department {
  systemKey: string | null;
  permissions: AppPermission[];
}
export interface UserProfile {
  firstName: string;
  lastName: string;
  address: {
    street: string | null;
    city: string | null;
    region: string | null;
    country: string | null;
    postalCode: string | null;
  } | null;
  phone: string | null;
  roleId: string;
  departmentId: string;
  roleName?: string;
  departmentName?: string;
}
