export interface ProductComponentItem {
  id: string;
  componentProductId: string;
  componentProductCode: string;
  componentProductName: string;
  quantity: number;
}

export interface ProductDetails {
  id: string;
  code: string;
  name: string;
  categoryId: string;
  categoryName: string;
  composite: boolean;
  photo: string | null;
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
