export interface QuoteProduct {
  id: string;
  code: string;
  name: string;
  categoryId: string;
  categoryName: string;
  composite: boolean;
  active: boolean;
  photo: string | null;
  customerPrice: number;
}
