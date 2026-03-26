import { UserType } from '../enums/user-type.enum';

export interface UserDetails {
  id: string;
  email: string;
  displayName: string;
  type: UserType;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  merchantId?: string;
  commissionDeductionPercentage: number;
}
