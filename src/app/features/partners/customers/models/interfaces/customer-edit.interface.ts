import { CustomerType } from '@features/partners/customers/models/enums/customer-type.enum';

export interface CustomerEditEmail {
  id?: string;
  customerId?: string;
  email: string;
}

export interface CustomerEditPhone {
  id?: string;
  customerId?: string;
  phone: string;
}

export interface CustomerEditAddress {
  id?: string;
  customerId?: string;
  address: string;
  billing: boolean;
  active: boolean;
  state?: string;
  municipality?: string;
  postalCode?: string;
}

export interface CustomerEdit {
  id: string;
  legalName: string;
  type: CustomerType;
  rif: string;
  alias: string;
  creditDays: number;
  creditLimit: number;
  active: boolean;
  emails: CustomerEditEmail[];
  phones: CustomerEditPhone[];
  addresses: CustomerEditAddress[];
  notes?: string;
  priceTypeId?: string;
}

export interface CustomerFormData {
  id?: string;
  code?: number;
  legalName: string;
  type: CustomerType;
  rif: string;
  alias: string;
  creditDays: number;
  creditLimit: number;
  active?: boolean;
  emails?: CustomerEditEmail[];
  phones?: CustomerEditPhone[];
  addresses?: CustomerEditAddress[];
  notes?: string;
  priceTypeId?: string;
}
