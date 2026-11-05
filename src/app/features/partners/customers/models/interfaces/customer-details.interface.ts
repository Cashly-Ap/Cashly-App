import { CustomerType } from '@features/partners/customers/models/enums/customer-type.enum';
import { CustomerPaymentType } from '@features/partners/customers/models/interfaces/customer-list.interface';

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
  state?: string;
  municipality?: string;
  postalCode?: string;
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
  paymentType?: CustomerPaymentType;
  active: boolean;
  createdAt: string;
  emails: CustomerEmail[];
  phones: CustomerPhone[];
  addresses: CustomerAddress[];
  notes?: string;
  priceTypeId?: string;
  deletable: boolean;
}
