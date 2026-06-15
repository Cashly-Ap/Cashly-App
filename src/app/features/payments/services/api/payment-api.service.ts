import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  PaymentList,
  PaymentDetail,
  PaymentCreate,
  PaymentUpdate,
} from '@features/payments/models/interfaces';

export interface PaymentFilters {
  dateFrom?: string;
  dateTo?: string;
  customerId?: string;
  status?: string;
}

interface PaymentListApiResponse {
  id: string;
  paymentNumber: string;
  customerName: string | null;
  invoiceNumber: string | null;
  amount: number;
  status: string;
  createdByName: string;
  createdAt: string;
}

interface PaymentDetailApiResponse {
  id: string;
  paymentNumber: string;
  customerId: string;
  customerName: string | null;
  customerRif: string | null;
  invoiceId: string;
  invoiceNumber: string | null;
  amount: number;
  reference: string | null;
  status: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/payments';

  getAll(filters?: PaymentFilters): Observable<PaymentList[]> {
    let params = new HttpParams();
    if (filters?.dateFrom) params = params.set('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params = params.set('dateTo', filters.dateTo);
    if (filters?.customerId) params = params.set('customerId', filters.customerId);
    if (filters?.status) params = params.set('status', filters.status);
    return this.http
      .get<PaymentListApiResponse[]>(this.baseUrl, { params })
      .pipe(map((items) => items.map((r) => this.toPaymentList(r))));
  }

  getById(id: string): Observable<PaymentDetail> {
    return this.http
      .get<PaymentDetailApiResponse>(`${this.baseUrl}/${id}`)
      .pipe(map((r) => this.toPaymentDetail(r)));
  }

  create(data: PaymentCreate): Observable<PaymentDetail> {
    return this.http
      .post<PaymentDetailApiResponse>(this.baseUrl, data)
      .pipe(map((r) => this.toPaymentDetail(r)));
  }

  update(id: string, data: PaymentUpdate): Observable<PaymentDetail> {
    return this.http
      .put<PaymentDetailApiResponse>(`${this.baseUrl}/${id}`, data)
      .pipe(map((r) => this.toPaymentDetail(r)));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  private toPaymentList(r: PaymentListApiResponse): PaymentList {
    return {
      id: r.id,
      paymentNumber: r.paymentNumber,
      customerName: r.customerName,
      invoiceNumber: r.invoiceNumber,
      amount: r.amount,
      status: r.status,
      createdByName: r.createdByName,
      createdAt: r.createdAt,
    };
  }

  private toPaymentDetail(r: PaymentDetailApiResponse): PaymentDetail {
    return {
      id: r.id,
      paymentNumber: r.paymentNumber,
      customerId: r.customerId,
      customerName: r.customerName,
      customerRif: r.customerRif,
      invoiceId: r.invoiceId,
      invoiceNumber: r.invoiceNumber,
      amount: r.amount,
      reference: r.reference,
      status: r.status,
      createdBy: r.createdBy,
      createdByName: r.createdByName,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  }
}
