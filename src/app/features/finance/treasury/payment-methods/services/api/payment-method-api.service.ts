import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DocumentListAction } from '@shared/models/document-list-action';
import { Observable, map } from 'rxjs';
import {
  PaymentMethodList,
  PaymentMethodDetail,
  PaymentMethodCreate,
  PaymentMethodUpdate,
} from '@features/finance/treasury/payment-methods/models/interfaces/payment-method.interface';
import { PagedResponse } from '@shared/models/interfaces/paged-response.interface';

export interface PaymentMethodFilters {
  action?: DocumentListAction;
  search?: string;
  active?: boolean;
  page?: number;
  size?: number;
  orderBy?: string;
  orderDir?: 'asc' | 'desc';
}

interface PaymentMethodListApiResponse {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  hasAssociatedRecords: boolean;
  createdAt: string;
}

interface PaymentMethodDetailApiResponse {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  hasAssociatedRecords: boolean;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentMethodApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/payment-methods';

  getAll(filters?: PaymentMethodFilters): Observable<PagedResponse<PaymentMethodList>> {
    let params = new HttpParams();
    if (filters?.action) params = params.set('action', filters.action);
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.active !== undefined) params = params.set('active', String(filters.active));
    if (filters?.page !== undefined) params = params.set('page', String(filters.page));
    if (filters?.size !== undefined) params = params.set('size', String(filters.size));
    if (filters?.orderBy) params = params.set('orderBy', filters.orderBy);
    if (filters?.orderDir) params = params.set('orderDir', filters.orderDir);
    return this.http
      .get<PagedResponse<PaymentMethodListApiResponse>>(this.baseUrl, { params })
      .pipe(
        map((res) => ({
          ...res,
          content: res.content.map((r) => this.toPaymentMethodList(r)),
        })),
      );
  }

  getById(id: string): Observable<PaymentMethodDetail> {
    return this.http
      .get<PaymentMethodDetailApiResponse>(`${this.baseUrl}/${id}`)
      .pipe(map((r) => this.toPaymentMethodDetail(r)));
  }

  create(data: PaymentMethodCreate): Observable<PaymentMethodDetail> {
    return this.http
      .post<PaymentMethodDetailApiResponse>(this.baseUrl, data)
      .pipe(map((r) => this.toPaymentMethodDetail(r)));
  }

  update(id: string, data: PaymentMethodUpdate): Observable<PaymentMethodDetail> {
    return this.http
      .put<PaymentMethodDetailApiResponse>(`${this.baseUrl}/${id}`, data)
      .pipe(map((r) => this.toPaymentMethodDetail(r)));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  toggle(id: string): Observable<PaymentMethodDetail> {
    return this.http
      .patch<PaymentMethodDetailApiResponse>(`${this.baseUrl}/${id}/toggle`, {})
      .pipe(map((r) => this.toPaymentMethodDetail(r)));
  }

  private toPaymentMethodList(r: PaymentMethodListApiResponse): PaymentMethodList {
    return {
      id: r.id,
      code: r.code,
      name: r.name,
      description: r.description,
      isActive: r.isActive,
      hasAssociatedRecords: r.hasAssociatedRecords,
      createdAt: r.createdAt,
    };
  }

  private toPaymentMethodDetail(r: PaymentMethodDetailApiResponse): PaymentMethodDetail {
    return {
      id: r.id,
      code: r.code,
      name: r.name,
      description: r.description,
      isActive: r.isActive,
      hasAssociatedRecords: r.hasAssociatedRecords,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  }
}
