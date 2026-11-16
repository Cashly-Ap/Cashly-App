import { CustomerType } from '@features/partners/customers/models/enums/customer-type.enum';

export type CustomerPaymentType = 'CASH' | 'CREDIT';

export interface CustomerList {
  id: string;
  code: number;
  alias: string;
  legalName: string;
  rif: string;
  type: CustomerType;
  active: boolean;
  paymentType?: CustomerPaymentType;
  deletable: boolean;
}
