import { ProductPriceFormItem } from '@features/catalog/products/models/interfaces/product-price-form-item.interface';

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
  purchasePrice?: number;
  components?: ProductComponentInput[];
  productPrices: ProductPriceFormItem[];
}

export interface ProductUpdate {
  name: string;
  categoryId: string;
  description?: string;
  purchasePrice?: number;
  components?: ProductComponentInput[];
  productPrices: ProductPriceFormItem[];
}
