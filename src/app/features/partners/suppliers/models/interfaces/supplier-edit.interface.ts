import { SupplierType } from '@features/partners/suppliers/models/enums/supplier-type.enum';

export interface SupplierEditEmail {
  id?: string;
  supplierId?: string;
  email: string;
}

export interface SupplierEditPhone {
  id?: string;
  supplierId?: string;
  phone: string;
}

export interface SupplierEditAddress {
  id?: string;
  supplierId?: string;
  address: string;
  billing: boolean;
  active: boolean;
  state?: string;
  municipality?: string;
  postalCode?: string;
}

export interface SupplierEdit {
  id: string;
  legalName: string;
  type: SupplierType;
  rif: string;
  alias: string;
  active: boolean;
  emails: SupplierEditEmail[];
  phones: SupplierEditPhone[];
  addresses: SupplierEditAddress[];
  notes?: string;
}

export interface SupplierFormData {
  id?: string;
  code?: number;
  legalName: string;
  type: SupplierType;
  rif: string;
  alias: string;
  active?: boolean;
  emails?: SupplierEditEmail[];
  phones?: SupplierEditPhone[];
  addresses?: SupplierEditAddress[];
  notes?: string;
}
