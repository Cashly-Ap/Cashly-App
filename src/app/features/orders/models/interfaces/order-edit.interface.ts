export interface WarehouseAllocationEdit {
  warehouseId: string;
  allocated: number;
}

export interface OrderItemEdit {
  productId: string;
  quantity: number;
  unitPrice: number;
  warehouseAllocations: WarehouseAllocationEdit[];
}

export interface OrderEdit {
  notes: string | null;
  items: OrderItemEdit[];
}
