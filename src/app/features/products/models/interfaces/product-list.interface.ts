export interface ProductPriceListItem {
  priceTypeId: string;
  price: number;
}

export interface ProductList {
  id: string;
  code: string;
  name: string;
  categoryId: string;
  categoryName: string;
  composite: boolean;
  active: boolean;
  basePrice?: number;
  productPrices: ProductPriceListItem[];
  stockTotal?: number;
  deletable: boolean;
}
