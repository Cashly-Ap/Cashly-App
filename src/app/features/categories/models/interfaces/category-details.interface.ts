import { CategoryList } from '@features/categories/models/interfaces/category-list.interface';

export interface CategoryDetails extends CategoryList {
  createdAt: string;
  updatedAt: string;
}
