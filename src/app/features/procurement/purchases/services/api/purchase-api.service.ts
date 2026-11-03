import { DocumentListAction } from '@shared/models/document-list-action';
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { PurchaseList } from '@features/procurement/purchases/models/interfaces/purchase-list.interface';
import { PurchaseDetails } from '@features/procurement/purchases/models/interfaces/purchase-details.interface';
import { PurchaseCreate } from '@features/procurement/purchases/models/interfaces/purchase-create.interface';
import { PurchaseEdit } from '@features/procurement/purchases/models/interfaces/purchase-edit.interface';
import { PurchaseProduct } from '@features/procurement/purchases/models/interfaces/purchase-product.interface';
import { PurchaseWarehouse } from '@features/procurement/purchases/models/interfaces/purchase-warehouse.interface';
import { PurchaseStatus } from '@features/procurement/purchases/models/enums/purchase-status.enum';

export interface CancelPurchaseRequest {
  reason: string;
  notes?: string;
}

export interface PurchaseFilters {
  action?: DocumentListAction;
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  supplierId?: string;
  productId?: string;
  orderBy?: string;
  orderDir?: 'asc' | 'desc';
}

export interface PurchaseProductFilters {
  search?: string;
  categoryId?: string;
  composite?: boolean;
  page?: number;
  size?: number;
}

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
}

interface PurchaseListApiResponse {
  id: string;
  purchaseNumber: string;
  supplierName: string;
  supplierRif: string;
  status: string;
  subtotal: number;
  createdAt: string;
}

interface PurchaseDetailApiResponse {
  id: string;
  purchaseNumber: string;
  supplierId: string;
  supplierName: string;
  supplierRif: string;
  createdBy: string;
  createdByName: string;
  status: string;
  notes: string | null;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
  lines: {
    id: string;
    productId: string;
    productName: string;
    productCode: string;
    quantity: number;
    unitCost: number;
    subtotal: number;
    allocations: {
      warehouseId: string;
      warehouseName: string;
      warehouseCode?: string;
      allocatedQuantity: number;
    }[];
    stockItems: {
      warehouseId: string;
      warehouseCode: string;
      warehouseName: string;
      quantity: number;
      reserved: number;
      available: number;
    }[];
  }[];
}

@Injectable({ providedIn: 'root' })
export class PurchaseApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/purchases';

  getAll(filters?: PurchaseFilters): Observable<PurchaseList[]> {
    let params = new HttpParams();
    if (filters?.action) params = params.set('action', filters.action);
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.dateFrom) params = params.set('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params = params.set('dateTo', filters.dateTo);
    if (filters?.supplierId) params = params.set('supplierId', filters.supplierId);
    if (filters?.productId) params = params.set('productId', filters.productId);
    if (filters?.orderBy) params = params.set('orderBy', filters.orderBy);
    if (filters?.orderDir) params = params.set('orderDir', filters.orderDir);
    return this.http
      .get<PurchaseListApiResponse[]>(this.baseUrl, { params })
      .pipe(map((items) => items.map((r) => this.toPurchaseList(r))));
  }

  private toPurchaseList(r: PurchaseListApiResponse): PurchaseList {
    return {
      id: r.id,
      purchaseNumber: r.purchaseNumber,
      supplierName: r.supplierName,
      supplierRif: r.supplierRif,
      status: r.status as PurchaseStatus,
      subtotal: r.subtotal,
      createdAt: r.createdAt,
    };
  }

  getById(id: string): Observable<PurchaseDetails> {
    return this.http
      .get<PurchaseDetailApiResponse>(`${this.baseUrl}/${id}`)
      .pipe(map((r) => this.toPurchaseDetails(r)));
  }

  create(data: PurchaseCreate): Observable<PurchaseDetails> {
    return this.http
      .post<PurchaseDetailApiResponse>(this.baseUrl, data)
      .pipe(map((r) => this.toPurchaseDetails(r)));
  }

  update(id: string, data: PurchaseEdit): Observable<PurchaseDetails> {
    return this.http
      .put<PurchaseDetailApiResponse>(`${this.baseUrl}/${id}`, data)
      .pipe(map((r) => this.toPurchaseDetails(r)));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  confirm(id: string): Observable<PurchaseDetails> {
    return this.http
      .put<PurchaseDetailApiResponse>(`${this.baseUrl}/${id}/confirm`, {})
      .pipe(map((r) => this.toPurchaseDetails(r)));
  }

  cancel(id: string, request: CancelPurchaseRequest): Observable<PurchaseDetails> {
    return this.http
      .put<PurchaseDetailApiResponse>(`${this.baseUrl}/${id}/cancel`, request)
      .pipe(map((r) => this.toPurchaseDetails(r)));
  }

  getProductsForPurchase(
    filters: PurchaseProductFilters,
  ): Observable<PageResponse<PurchaseProduct>> {
    let params = new HttpParams();
    if (filters.search) params = params.set('search', filters.search);
    if (filters.categoryId) params = params.set('categoryId', filters.categoryId);
    if (filters.composite !== undefined)
      params = params.set('composite', String(filters.composite));
    if (filters.page !== undefined) params = params.set('page', String(filters.page));
    if (filters.size !== undefined) params = params.set('size', String(filters.size));
    return this.http.get<PageResponse<PurchaseProduct>>(`${this.baseUrl}/products`, { params });
  }

  getWarehousesForPurchase(): Observable<PurchaseWarehouse[]> {
    return this.http.get<PurchaseWarehouse[]>(`${this.baseUrl}/warehouses`);
  }

  private toPurchaseDetails(r: PurchaseDetailApiResponse): PurchaseDetails {
    return {
      id: r.id,
      purchaseNumber: r.purchaseNumber,
      supplierId: r.supplierId,
      supplierName: r.supplierName,
      supplierRif: r.supplierRif,
      createdBy: r.createdBy,
      createdByName: r.createdByName,
      status: r.status as PurchaseStatus,
      notes: r.notes,
      subtotal: r.subtotal,
      lines: r.lines.map((l) => ({
        id: l.id,
        productId: l.productId,
        productName: l.productName,
        productCode: l.productCode,
        quantity: l.quantity,
        unitCost: l.unitCost,
        subtotal: l.subtotal,
        allocations: (l.allocations ?? []).map((a) => ({
          warehouseId: a.warehouseId,
          warehouseName: a.warehouseName,
          warehouseCode: a.warehouseCode ?? '',
          allocatedQuantity: a.allocatedQuantity,
        })),
        stockItems: (l.stockItems ?? []).map((s) => ({
          warehouseId: s.warehouseId,
          warehouseCode: s.warehouseCode,
          warehouseName: s.warehouseName,
          quantity: s.quantity,
          reserved: s.reserved,
          available: s.available,
        })),
      })),
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  }
}
