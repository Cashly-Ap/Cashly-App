import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ReturnList, ReturnDetail, ReturnCreate } from '../../models/interfaces';
import { ReturnType } from '../../models/enums/return-type.enum';
import { ReturnStatus } from '../../models/enums/return-status.enum';

export interface ReturnFilters {
  search?: string;
  customerId?: string;
  returnType?: string;
  dateFrom?: string;
  dateTo?: string;
  orderBy?: string;
  orderDir?: 'asc' | 'desc';
}

interface ReturnListApiResponse {
  id: string;
  returnNumber: string;
  invoiceNumber: string;
  customerName: string;
  returnType: string;
  reason: string;
  status: string;
  createdAt: string;
}

interface ReturnDetailApiResponse {
  id: string;
  returnNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerRif: string;
  returnType: string;
  reason: string;
  status: string;
  totalAmount: number;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  lines: {
    id: string;
    invoiceLineId: string;
    productId: string;
    productName: string;
    quantity: number;
    warehouseId: string;
    warehouseName: string;
    unitPrice: number;
    lineTotal: number;
  }[];
}

@Injectable({ providedIn: 'root' })
export class ReturnApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/finances/returns';

  getAll(filters?: ReturnFilters): Observable<ReturnList[]> {
    let params = new HttpParams();
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.customerId) params = params.set('customerId', filters.customerId);
    if (filters?.returnType) params = params.set('returnType', filters.returnType);
    if (filters?.dateFrom) params = params.set('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params = params.set('dateTo', filters.dateTo);
    if (filters?.orderBy) params = params.set('orderBy', filters.orderBy);
    if (filters?.orderDir) params = params.set('orderDir', filters.orderDir);
    return this.http
      .get<ReturnListApiResponse[]>(this.baseUrl, { params })
      .pipe(map((items) => items.map((r) => this.toList(r))));
  }

  getById(id: string): Observable<ReturnDetail> {
    return this.http.get<ReturnDetailApiResponse>(`${this.baseUrl}/${id}`).pipe(
      map((r) => this.toDetail(r)),
    );
  }

  create(data: ReturnCreate): Observable<ReturnDetail> {
    return this.http.post<ReturnDetailApiResponse>(this.baseUrl, data).pipe(
      map((r) => this.toDetail(r)),
    );
  }

  cancel(id: string): Observable<ReturnDetail> {
    return this.http.put<ReturnDetailApiResponse>(`${this.baseUrl}/${id}/cancel`, {}).pipe(
      map((r) => this.toDetail(r)),
    );
  }

  private toList(r: ReturnListApiResponse): ReturnList {
    return {
      id: r.id,
      returnNumber: r.returnNumber,
      invoiceNumber: r.invoiceNumber,
      customerName: r.customerName,
      returnType: r.returnType,
      reason: r.reason,
      status: r.status,
      createdAt: r.createdAt,
    };
  }

  private toDetail(r: ReturnDetailApiResponse): ReturnDetail {
    return {
      id: r.id,
      returnNumber: r.returnNumber,
      invoiceId: r.invoiceId,
      invoiceNumber: r.invoiceNumber,
      customerId: r.customerId,
      customerName: r.customerName,
      customerRif: r.customerRif,
      returnType: r.returnType as ReturnType,
      reason: r.reason,
      status: r.status as ReturnStatus,
      totalAmount: r.totalAmount,
      createdBy: r.createdBy,
      createdByName: r.createdByName,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      lines: r.lines.map((l) => ({
        id: l.id,
        invoiceLineId: l.invoiceLineId,
        productId: l.productId,
        productName: l.productName,
        quantity: l.quantity,
        warehouseId: l.warehouseId,
        warehouseName: l.warehouseName,
        unitPrice: l.unitPrice,
        lineTotal: l.lineTotal,
      })),
    };
  }
}
