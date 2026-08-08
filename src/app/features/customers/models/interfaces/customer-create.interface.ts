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
  state?: string;
  municipality?: string;
  postalCode?: string;
}

export interface CustomerCreate {
  legalName: string;
  type: CustomerType;
  rif: string;
  alias: string;
  creditDays: number;
  creditLimit: number;
  active: boolean;
  portalAccess?: boolean;
  emails: CustomerCreateEmail[];
  phones: CustomerCreatePhone[];
  addresses: CustomerCreateAddress[];
  warehouseIds: string[];
  notes?: string;
  priceTypeId?: string;
}
