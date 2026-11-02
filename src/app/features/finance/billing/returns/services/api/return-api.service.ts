import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DocumentListAction } from '@shared/models/document-list-action';
import { Observable, map } from 'rxjs';
import {
  ReturnList,
  ReturnDetail,
  ReturnCreate,
} from '@features/finance/billing/returns/models/interfaces/return.interface';

export interface ReturnFilters {
  action?: DocumentListAction;
  search?: string;
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
  returnType?: string;
  orderBy?: string;
  orderDir?: 'asc' | 'desc';
}

interface AllocationApiResponse {
  warehouseId: string;
  warehouseName?: string;
  allocated: number;
}

interface ReturnLineApiResponse {
  id: string;
  invoiceLineId: string;
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  allocations: AllocationApiResponse[];
}

interface ReturnListApiResponse {
  id: string;
  returnNumber: string;
  customerName: string;
  invoiceNumber: string;
  returnType: string;
  totalAmount: number;
  total?: number;
  reason: string;
  createdByName: string;
  createdAt: string;
}

interface ReturnDetailApiResponse {
  id: string;
  returnNumber: string;
  customerId: string;
  customerName: string;
  customerRif: string;
  invoiceId: string;
  invoiceNumber: string;
  returnType: string;
  totalAmount: number;
  total?: number;
  reason: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  lines: ReturnLineApiResponse[];
}

@Injectable({ providedIn: 'root' })
export class ReturnApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/returns';

  getAll(filters?: ReturnFilters): Observable<ReturnList[]> {
    let params = new HttpParams();
    if (filters?.action) params = params.set('action', filters.action);
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.customerId) params = params.set('customerId', filters.customerId);
    if (filters?.dateFrom) params = params.set('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params = params.set('dateTo', filters.dateTo);
    if (filters?.returnType) params = params.set('returnType', filters.returnType);
    if (filters?.orderBy) params = params.set('orderBy', filters.orderBy);
    if (filters?.orderDir) params = params.set('orderDir', filters.orderDir);
    return this.http
      .get<ReturnListApiResponse[]>(this.baseUrl, { params })
      .pipe(map((items) => items.map((r) => this.toList(r))));
  }

  getById(id: string): Observable<ReturnDetail> {
    return this.http
      .get<ReturnDetailApiResponse>(`${this.baseUrl}/${id}`)
      .pipe(map((r) => this.toDetail(r)));
  }

  create(data: ReturnCreate): Observable<ReturnDetail> {
    return this.http
      .post<ReturnDetailApiResponse>(this.baseUrl, data)
      .pipe(map((r) => this.toDetail(r)));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  private toList(r: ReturnListApiResponse): ReturnList {
    return {
      id: r.id,
      returnNumber: r.returnNumber,
      customerName: r.customerName ?? '',
      invoiceNumber: r.invoiceNumber ?? '',
      returnType: r.returnType,
      totalAmount: r.total ?? r.totalAmount ?? 0,
      reason: r.reason,
      createdByName: r.createdByName,
      createdAt: r.createdAt,
    };
  }

  private toDetail(r: ReturnDetailApiResponse): ReturnDetail {
    return {
      id: r.id,
      returnNumber: r.returnNumber,
      customerId: r.customerId,
      customerName: r.customerName ?? '',
      customerRif: r.customerRif ?? '',
      invoiceId: r.invoiceId,
      invoiceNumber: r.invoiceNumber ?? '',
      returnType: r.returnType,
      totalAmount: r.totalAmount ?? r.total ?? 0,
      reason: r.reason,
      createdBy: r.createdBy,
      createdByName: r.createdByName,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      lines: (r.lines ?? []).map((l) => ({
        id: l.id,
        invoiceLineId: l.invoiceLineId,
        productId: l.productId,
        productName: l.productName,
        productCode: l.productCode ?? '',
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        allocations: (l.allocations ?? []).map((a) => ({
          warehouseId: a.warehouseId,
          warehouseName: a.warehouseName ?? '',
          allocated: a.allocated,
        })),
      })),
    };
  }
}
