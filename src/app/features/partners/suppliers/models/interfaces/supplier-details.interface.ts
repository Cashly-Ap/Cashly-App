import { SupplierType } from '@features/partners/suppliers/models/enums/supplier-type.enum';

export interface SupplierEmail {
  id: string;
  supplierId: string;
  email: string;
}

export interface SupplierPhone {
  id: string;
  supplierId: string;
  phone: string;
}

export interface SupplierAddress {
  id: string;
  supplierId: string;
  address: string;
  billing: boolean;
  active: boolean;
  state?: string;
  municipality?: string;
  postalCode?: string;
}

export interface SupplierDetails {
  id: string;
  code: number;
  legalName: string;
  type: SupplierType;
  rif: string;
  alias: string;
  active: boolean;
  createdAt: string;
  emails: SupplierEmail[];
  phones: SupplierPhone[];
  addresses: SupplierAddress[];
  notes?: string;
}
