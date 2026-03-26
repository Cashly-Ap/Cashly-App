import { UserType } from '../enums/user-type.enum';

export interface UserDetails {
  id: string;
  email: string;
  userName: string;
  role: UserType;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  merchantId?: string;
  commissionDeductionPercentage: number;
}
