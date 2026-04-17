import { CustomerType } from '@features/customers/models/enums/customer-type.enum';

export interface CustomerEmail {
  id: string;
  customerId: string;
  email: string;
}

export interface CustomerPhone {
  id: string;
  customerId: string;
  phone: string;
}

export interface CustomerAddress {
  id: string;
  customerId: string;
  address: string;
  billing: boolean;
  active: boolean;
}

export interface CustomerDetails {
  id: string;
  code: number;
  legalName: string;
  type: CustomerType;
  rif: string;
  alias: string;
  creditDays: number;
  creditLimit: number;
  active: boolean;
  createdAt: string;
  emails: CustomerEmail[];
  phones: CustomerPhone[];
  addresses: CustomerAddress[];
}
