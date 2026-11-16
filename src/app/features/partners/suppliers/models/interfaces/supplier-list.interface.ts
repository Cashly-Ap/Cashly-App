import { SupplierType } from '@features/partners/suppliers/models/enums/supplier-type.enum';

export interface SupplierList {
  id: string;
  code: number;
  alias: string;
  legalName: string;
  rif: string;
  type: SupplierType;
  creditDays: number;
  creditLimit: number;
  active: boolean;
  hasPurchases: boolean;
}
