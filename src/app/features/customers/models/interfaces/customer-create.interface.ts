import { CustomerType } from '@features/customers/models/enums/customer-type.enum';

export interface CustomerCreateEmail {
  email: string;
}

export interface CustomerCreatePhone {
  phone: string;
}

export interface CustomerCreateAddress {
  address: string;
  billing: boolean;
  active: boolean;
}

export interface CustomerCreate {
  legalName: string;
  type: CustomerType;
  rif: string;
  alias: string;
  creditDays: number;
  creditLimit: number;
  active: boolean;
  emails: CustomerCreateEmail[];
  phones: CustomerCreatePhone[];
  addresses: CustomerCreateAddress[];
}
