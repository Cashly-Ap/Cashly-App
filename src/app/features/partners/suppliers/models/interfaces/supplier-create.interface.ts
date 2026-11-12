import { SupplierType } from '@features/partners/suppliers/models/enums/supplier-type.enum';

export interface SupplierCreateEmail {
  email: string;
}

export interface SupplierCreatePhone {
  phone: string;
}

export interface SupplierCreateAddress {
  address: string;
  billing: boolean;
  active: boolean;
  state?: string;
  municipality?: string;
  postalCode?: string;
}

export interface SupplierCreate {
  legalName: string;
  type: SupplierType;
  rif: string;
  alias: string;
  creditDays: number;
  creditLimit: number;
  active: boolean;
  emails: SupplierCreateEmail[];
  phones: SupplierCreatePhone[];
  addresses: SupplierCreateAddress[];
  notes?: string;
}
