import { OrderList, OrderDetails } from '@features/orders/models/interfaces';

export interface OrderFormItem {
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderFormModel {
  id?: string;
  customerId: string;
  notes: string;
  items: OrderFormItem[];
}

export class OrderMapper {
  static toList(details: OrderDetails): OrderList {
    return {
      id: details.id,
      orderNumber: details.orderNumber,
      customerId: details.customerId,
      customerAlias: details.customerAlias,
      status: details.status,
      totalAmount: details.totalAmount,
      createdAt: details.createdAt,
    };
  }

  static toFormModel(details: OrderDetails): OrderFormModel {
    return {
      id: details.id,
      customerId: details.customerId,
      notes: details.notes ?? '',
      items: details.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        productCode: item.productCode,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
      })),
    };
  }
}
