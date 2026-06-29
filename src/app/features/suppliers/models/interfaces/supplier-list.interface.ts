import { SupplierType } from '@features/suppliers/models/enums/supplier-type.enum';

export interface SupplierList {
  id: string;
  code: number;
  alias: string;
  legalName: string;
  rif: string;
  type: SupplierType;
  active: boolean;
}
