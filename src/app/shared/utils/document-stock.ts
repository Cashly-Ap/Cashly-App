const QUANTITY_TOLERANCE = 0.000001;

export interface DocumentStockLine {
  productId: string;
  productName: string;
  quantity: number;
  allocations: {
    warehouseId: string;
    warehouseName: string;
    quantity: number;
    available: number;
  }[];
}

export interface DocumentStockRow {
  productName: string;
  warehouseName: string;
  quantity: number;
  available: number;
  sufficient: boolean;
}

export function reviewDocumentStock(
  lines: DocumentStockLine[],
  reserved = false,
): {
  valid: boolean;
  rows: DocumentStockRow[];
} {
  const demand = new Map<string, number>();
  for (const line of lines) {
    for (const allocation of line.allocations) {
      const key = `${line.productId}:${allocation.warehouseId}`;
      demand.set(key, (demand.get(key) ?? 0) + allocation.quantity);
    }
  }
  const rows = lines.flatMap((line) => {
    if (!line.allocations.length) {
      return [
        {
          productName: line.productName,
          warehouseName: '—',
          quantity: line.quantity,
          available: 0,
          sufficient: false,
        },
      ];
    }
    const complete =
      Math.abs(
        line.allocations.reduce((sum, allocation) => sum + allocation.quantity, 0) - line.quantity,
      ) < QUANTITY_TOLERANCE;
    return line.allocations.map((allocation) => {
      const requested = demand.get(`${line.productId}:${allocation.warehouseId}`) ?? 0;
      const available = allocation.available + (reserved ? requested : 0);
      return {
        productName: line.productName,
        warehouseName: allocation.warehouseName,
        quantity: allocation.quantity,
        available,
        sufficient:
          complete &&
          line.quantity > 0 &&
          allocation.quantity > 0 &&
          Number.isFinite(available) &&
          available >= requested,
      };
    });
  });
  return { valid: rows.length > 0 && rows.every((row) => row.sufficient), rows };
}
