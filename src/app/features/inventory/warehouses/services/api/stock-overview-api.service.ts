import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PagedResponse } from '@shared/models/interfaces/paged-response.interface';

export type StockGroupBy = 'NONE' | 'PRODUCT' | 'WAREHOUSE';

export interface StockOverviewFilters {
  groupBy?: StockGroupBy;
  warehouseId?: string;
  categoryId?: string;
  search?: string;
  page: number;
  size: number;
}

export interface StockOverviewItem {
  id: string;
  warehouseId: string;
  warehouseName: string;
  productId: string;
  productCode: string;
  productName: string;
  categoryId: string | null;
  categoryName: string | null;
  composite: boolean;
  quantity: number;
  reserved: number;
  available: number;
}

export interface StockOverviewSummary {
  productCount: number;
  warehouseCount: number;
  totalQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
}

export interface StockOverviewGroup {
  id: string;
  name: string;
  productCode: string | null;
  categoryName: string | null;
  quantity: number;
  reserved: number;
  available: number;
  productCount: number;
  warehouseCount: number;
  items: StockOverviewItem[];
}

interface StockOverviewCommon {
  summary: StockOverviewSummary;
  warehouses: { id: string; name: string }[];
  categories: { id: string; name: string }[];
}

export type StockOverviewResponse = StockOverviewCommon &
  (
    | { groupBy: 'NONE'; stock: PagedResponse<StockOverviewItem>; groups: null }
    | { groupBy: 'PRODUCT' | 'WAREHOUSE'; stock: null; groups: PagedResponse<StockOverviewGroup> }
  );

@Injectable({ providedIn: 'root' })
export class StockOverviewApiService {
  private readonly http = inject(HttpClient);

  getOverview(filters: StockOverviewFilters): Observable<StockOverviewResponse> {
    let params = new HttpParams().set('page', filters.page).set('size', filters.size);
    if (filters.groupBy) params = params.set('groupBy', filters.groupBy);
    if (filters.warehouseId) params = params.set('warehouseId', filters.warehouseId);
    if (filters.categoryId) params = params.set('categoryId', filters.categoryId);
    if (filters.search?.trim()) params = params.set('search', filters.search.trim());
    return this.http.get<StockOverviewResponse>('/api/warehouses/stock', { params });
  }
}
