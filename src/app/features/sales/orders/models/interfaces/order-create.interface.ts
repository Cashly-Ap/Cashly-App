export interface WarehouseAllocationCreate {
  warehouseId: string;
  allocated: number;
}

export interface OrderItemCreate {
  productId: string;
  quantity: number;
  unitPrice: number;
  warehouseAllocations: WarehouseAllocationCreate[];
}

export interface OrderCreate {
  customerId: string;
  notes: string | null;
  lines: OrderItemCreate[];
}
