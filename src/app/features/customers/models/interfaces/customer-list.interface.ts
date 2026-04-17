import { CustomerType } from '@features/customers/models/enums/customer-type.enum';

export interface CustomerList {
  id: string;
  code: number;
  alias: string;
  legalName: string;
  rif: string;
  type: CustomerType;
  active: boolean;
}
