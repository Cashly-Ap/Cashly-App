export interface OrderItemEdit {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderEdit {
  notes: string | null;
  items: OrderItemEdit[];
}
