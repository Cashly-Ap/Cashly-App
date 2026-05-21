import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { PaymentList, PaymentDetail, PaymentCreate, ApplyPayment } from '../../models/interfaces';
import { PaymentStatus } from '../../models/enums/payment-status.enum';
import { PaymentType } from '../../models/enums/payment-type.enum';

export interface PaymentFilters {
  search?: string;
  customerId?: string;
  type?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  orderBy?: string;
  orderDir?: 'asc' | 'desc';
}

interface PaymentListApiResponse {
  id: string;
  paymentNumber: string;
  customerId: string;
  customerName: string;
  type: string;
  amount: number;
  paymentMethodName: string;
  status: string;
  appliedAmount: number;
  paymentDate: string;
  createdAt: string;
}

interface PaymentDetailApiResponse {
  id: string;
  paymentNumber: string;
  customerId: string;
  customerName: string;
  customerRif: string;
  type: string;
  amount: number;
  paymentMethodId: string;
  paymentMethodName: string;
  status: string;
  appliedAmount: number;
  remainingAmount: number;
  referenceNumber: string | null;
  paymentDate: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  allocations: {
    id: string;
    invoiceId: string;
    invoiceNumber: string | null;
    allocatedAmount: number;
    createdAt: string;
  }[];
}

@Injectable({ providedIn: 'root' })
export class PaymentApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/finances/payments';

  getAll(filters?: PaymentFilters): Observable<PaymentList[]> {
    let params = new HttpParams();
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.customerId) params = params.set('customerId', filters.customerId);
    if (filters?.type) params = params.set('type', filters.type);
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.dateFrom) params = params.set('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params = params.set('dateTo', filters.dateTo);
    if (filters?.orderBy) params = params.set('orderBy', filters.orderBy);
    if (filters?.orderDir) params = params.set('orderDir', filters.orderDir);
    return this.http
      .get<PaymentListApiResponse[]>(this.baseUrl, { params })
      .pipe(map((items) => items.map((r) => this.toPaymentList(r))));
  }

  getById(id: string): Observable<PaymentDetail> {
    return this.http.get<PaymentDetailApiResponse>(`${this.baseUrl}/${id}`).pipe(
      map((r) => this.toPaymentDetail(r)),
    );
  }

  create(data: PaymentCreate): Observable<PaymentDetail> {
    return this.http.post<PaymentDetailApiResponse>(this.baseUrl, data).pipe(
      map((r) => this.toPaymentDetail(r)),
    );
  }

  apply(id: string, data: ApplyPayment): Observable<PaymentDetail> {
    return this.http.post<PaymentDetailApiResponse>(`${this.baseUrl}/${id}/apply`, data).pipe(
      map((r) => this.toPaymentDetail(r)),
    );
  }

  cancel(id: string, reason: string): Observable<PaymentDetail> {
    return this.http.put<PaymentDetailApiResponse>(`${this.baseUrl}/${id}/cancel`, { reason }).pipe(
      map((r) => this.toPaymentDetail(r)),
    );
  }

  private toPaymentList(r: PaymentListApiResponse): PaymentList {
    return {
      id: r.id,
      paymentNumber: r.paymentNumber,
      customerId: r.customerId,
      customerName: r.customerName,
      type: r.type as PaymentType,
      amount: r.amount,
      paymentMethodName: r.paymentMethodName,
      status: r.status as PaymentStatus,
      appliedAmount: r.appliedAmount,
      paymentDate: r.paymentDate,
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
      type: r.type as PaymentType,
      amount: r.amount,
      paymentMethodId: r.paymentMethodId,
      paymentMethodName: r.paymentMethodName,
      status: r.status as PaymentStatus,
      appliedAmount: r.appliedAmount,
      remainingAmount: r.remainingAmount,
      referenceNumber: r.referenceNumber,
      paymentDate: r.paymentDate,
      notes: r.notes,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      allocations: r.allocations.map((a) => ({
        id: a.id,
        invoiceId: a.invoiceId,
        invoiceNumber: a.invoiceNumber ?? undefined,
        allocatedAmount: a.allocatedAmount,
        createdAt: a.createdAt,
      })),
    };
  }
}
