export interface PurchaseProduct {
  id: string;
  code: string;
  name: string;
  categoryId: string;
  categoryName: string;
  composite: boolean;
  active: boolean;
  photo: string | null;
  purchasePrice: number;
}
