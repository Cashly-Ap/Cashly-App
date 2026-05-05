export interface OrderFormData {
  customerId: string;
  notes: string;
  items: OrderItemFormData[];
}

export interface OrderItemFormData {
  productId: string;
  quantity: number;
  unitPrice: number;
}
