import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PagedResponse } from '@shared/models/interfaces/paged-response.interface';
import { isUuid } from '@shared/utils/uuid.utils';
import { MovementType } from '@features/inventory/warehouses/models/enums/movement-type.enum';

export type MovementGroupBy = 'NONE' | 'PRODUCT' | 'WAREHOUSE' | 'MOVEMENT_TYPE';

export interface MovementOverviewFilters {
  groupBy?: MovementGroupBy;
  warehouseId?: string | null;
  productId?: string | null;
  movementType?: MovementType | '';
  search?: string;
  page: number;
  size: number;
}

export interface MovementOverviewItem {
  id: string;
  warehouseId: string;
  warehouseName: string;
  productId: string;
  productCode: string;
  productName: string;
  categoryName: string | null;
  movementType: MovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  referenceType: string | null;
  referenceId: string | null;
  referenceNumber: string | null;
  notes: string | null;
  createdAt: string;
}

export interface MovementOverviewGroup {
  id: string;
  name: string;
  movementType: MovementType | null;
  productCode: string | null;
  categoryName: string | null;
  warehouseName: string | null;
  movementCount: number;
  entryQuantity: number;
  exitQuantity: number;
  netQuantity: number;
  items: MovementOverviewItem[];
}

export interface MovementOverviewSummary {
  movementCount: number;
  productCount: number;
  warehouseCount: number;
  entryQuantity: number;
  exitQuantity: number;
  netQuantity: number;
}

export interface MovementOption {
  id: string;
  name: string;
}

export interface MovementProductOption {
  id: string;
  name: string;
  code: string;
}

interface MovementOverviewCommon {
  summary?: MovementOverviewSummary | null;
  warehouses?: MovementOption[] | null;
  products?: MovementProductOption[] | null;
}

export type MovementOverviewResponse = MovementOverviewCommon &
  (
    | { groupBy: 'NONE'; movements: PagedResponse<MovementOverviewItem>; groups: null }
    | {
        groupBy: 'PRODUCT' | 'WAREHOUSE' | 'MOVEMENT_TYPE';
        movements: null;
        groups: PagedResponse<MovementOverviewGroup>;
      }
  );

const MAX_PAGE_SIZE = 100;
const MAX_SEARCH_LENGTH = 200;
const GROUP_BY_VALUES: readonly MovementGroupBy[] = [
  'NONE',
  'PRODUCT',
  'WAREHOUSE',
  'MOVEMENT_TYPE',
];
const MOVEMENT_TYPE_VALUES: readonly MovementType[] = [
  'ENTRY',
  'EXIT',
  'ADJUSTMENT',
  'TRANSFER_IN',
  'TRANSFER_OUT',
  'COMPONENT_EXIT',
  'RETURN_ENTRY',
  'CANCEL_ENTRY',
  'SALE_EXIT',
];

@Injectable({ providedIn: 'root' })
export class MovementOverviewApiService {
  private readonly http = inject(HttpClient);

  getOverview(filters: MovementOverviewFilters): Observable<MovementOverviewResponse> {
    let params = new HttpParams()
      .set('page', normalizePage(filters.page))
      .set('size', normalizeSize(filters.size));
    const groupBy = normalizeGroupBy(filters.groupBy);
    if (groupBy) params = params.set('groupBy', groupBy);
    if (isUuid(filters.warehouseId)) params = params.set('warehouseId', filters.warehouseId);
    if (isUuid(filters.productId)) params = params.set('productId', filters.productId);
    const movementType = normalizeMovementType(filters.movementType);
    if (movementType) params = params.set('movementType', movementType);
    const search = normalizeSearch(filters.search);
    if (search) params = params.set('search', search);
    return this.http.get<MovementOverviewResponse>('/api/warehouses/movements', { params });
  }
}

function normalizePage(page: number): number {
  return Number.isFinite(page) ? Math.max(0, Math.trunc(page)) : 0;
}

function normalizeSize(size: number): number {
  if (!Number.isFinite(size)) return 10;
  return Math.min(MAX_PAGE_SIZE, Math.max(1, Math.trunc(size)));
}

function normalizeGroupBy(groupBy?: MovementGroupBy | null): MovementGroupBy | null {
  return groupBy && GROUP_BY_VALUES.includes(groupBy) ? groupBy : null;
}

function normalizeMovementType(movementType?: MovementType | '' | null): MovementType | null {
  return movementType && MOVEMENT_TYPE_VALUES.includes(movementType) ? movementType : null;
}

function normalizeSearch(search?: string | null): string {
  return (search ?? '').trim().slice(0, MAX_SEARCH_LENGTH);
}
