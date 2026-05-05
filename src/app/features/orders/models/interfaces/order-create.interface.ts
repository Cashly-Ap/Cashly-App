export interface OrderItemCreate {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderCreate {
  customerId: string;
  notes: string | null;
  items: OrderItemCreate[];
}
