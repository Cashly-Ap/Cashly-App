import { ProductPriceFormItem } from '@features/products/models/interfaces/product-price-form-item.interface';

export interface ProductComponentInput {
  componentProductId: string;
  quantity: number;
}

export interface ProductCreate {
  code?: string;
  name: string;
  categoryId: string;
  description?: string;
  composite: boolean;
  basePrice?: number;
  purchasePrice?: number;
  profitMargin?: number;
  components?: ProductComponentInput[];
  productPrices: ProductPriceFormItem[];
}

export interface ProductUpdate {
  name: string;
  categoryId: string;
  description?: string;
  basePrice?: number;
  purchasePrice?: number;
  profitMargin?: number;
  components?: ProductComponentInput[];
  productPrices: ProductPriceFormItem[];
}
