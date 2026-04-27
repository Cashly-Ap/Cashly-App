export interface ProductComponentItem {
  componentId: string;
  componentName: string;
  quantity: number;
}

export interface ProductDetails {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  composite: boolean;
  basePrice?: number;
  purchasePrice?: number;
  profitMargin?: number;
  description?: string;
  active: boolean;
  stockTotal?: number;
  components: ProductComponentItem[];
  createdAt: string;
  updatedAt: string;
}
