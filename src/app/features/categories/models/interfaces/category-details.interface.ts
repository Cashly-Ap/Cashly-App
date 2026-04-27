import { CategoryList } from './category-list.interface';

export interface CategoryDetails extends CategoryList {
  createdAt: string;
  updatedAt: string;
}
