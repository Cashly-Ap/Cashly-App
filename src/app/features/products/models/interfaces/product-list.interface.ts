export interface ProductList {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  composite: boolean;
  salePrice?: number;
  active: boolean;
  stockTotal?: number;
}
