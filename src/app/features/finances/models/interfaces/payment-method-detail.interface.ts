export interface PaymentMethodDetail {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethodCreate {
  name: string;
  description?: string;
}

export interface PaymentMethodUpdate {
  name: string;
  description?: string;
  isActive?: boolean;
}
