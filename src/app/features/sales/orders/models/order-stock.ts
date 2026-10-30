import { OrderDetails } from './interfaces/order-details.interface';
import { DocumentStockLine } from '@shared/utils/document-stock';

export function orderStockLines(order: OrderDetails | null): DocumentStockLine[] {
  return (
    order?.items.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      allocations: item.warehouseAllocations.map((allocation) => ({
        warehouseId: allocation.warehouseId,
        warehouseName: allocation.warehouseName,
        quantity: allocation.allocated,
        available:
          item.warehouseStocks?.find((stock) => stock.warehouseId === allocation.warehouseId)
            ?.available ?? allocation.available,
      })),
    })) ?? []
  );
}
