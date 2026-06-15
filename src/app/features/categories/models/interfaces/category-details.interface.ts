import { CategoryList } from '@features/categories/models/interfaces/category-list';

export interface CategoryDetails extends CategoryList {
  createdAt: string;
  updatedAt: string;
}
