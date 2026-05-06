import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { OrderList, OrderDetails, OrderCreate, OrderEdit } from '../../models/interfaces';
import { OrderStatus } from '../../models/enums/order-status.enum';

export interface OrderFilters {
  search?: string;
  status?: string;
  customerId?: string;
}

interface OrderListApiResponse {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  status: string;
  deliveryDate: string;
  subtotal: number;
  lineCount: number;
  invoiceId: string | null;
  createdAt: string;
}

interface OrderDetailApiResponse {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerRif: string;
  createdBy: string;
  createdByName: string;
  status: string;
  deliveryDate: string;
  notes: string | null;
  subtotal: number;
  invoiceId: string | null;
  invoiceNumber: string | null;
  cancelledAt: string | null;
  cancelledReason: string | null;
  createdAt: string;
  updatedAt: string;
  lines: {
    id: string;
    productId: string;
    productName: string;
    productCode: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }[];
}

@Injectable({ providedIn: 'root' })
export class OrderApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/orders';

  getAll(filters?: OrderFilters): Observable<OrderList[]> {
    let params = new HttpParams();
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.customerId) params = params.set('customerId', filters.customerId);
    return this.http
      .get<OrderListApiResponse[]>(this.baseUrl, { params })
      .pipe(map((items) => items.map((r) => this.toOrderList(r))));
  }

  private toOrderList(r: OrderListApiResponse): OrderList {
    return {
      id: r.id,
      orderNumber: r.orderNumber,
      customerId: r.customerId,
      customerAlias: r.customerName,
      status: r.status as OrderStatus,
      totalAmount: r.subtotal,
      createdAt: r.createdAt,
    };
  }

  getById(id: string): Observable<OrderDetails> {
    return this.http.get<OrderDetailApiResponse>(`${this.baseUrl}/${id}`).pipe(
      map((r) => this.toOrderDetails(r)),
    );
  }

  create(data: OrderCreate): Observable<OrderDetails> {
    return this.http.post<OrderDetailApiResponse>(this.baseUrl, data).pipe(
      map((r) => this.toOrderDetails(r)),
    );
  }

  update(id: string, data: OrderEdit): Observable<OrderDetails> {
    return this.http.put<OrderDetailApiResponse>(`${this.baseUrl}/${id}`, data).pipe(
      map((r) => this.toOrderDetails(r)),
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  confirm(id: string): Observable<OrderDetails> {
    return this.http.put<OrderDetailApiResponse>(`${this.baseUrl}/${id}/confirm`, {}).pipe(
      map((r) => this.toOrderDetails(r)),
    );
  }

  cancel(id: string): Observable<OrderDetails> {
    return this.http.put<OrderDetailApiResponse>(`${this.baseUrl}/${id}/cancel`, {}).pipe(
      map((r) => this.toOrderDetails(r)),
    );
  }

  private toOrderDetails(r: OrderDetailApiResponse): OrderDetails {
    return {
      id: r.id,
      orderNumber: r.orderNumber,
      customerId: r.customerId,
      customerAlias: r.customerName,
      customerLegalName: r.customerRif,
      status: r.status as OrderStatus,
      notes: r.notes,
      totalAmount: r.subtotal,
      items: r.lines.map((l) => ({
        id: l.id,
        productId: l.productId,
        productName: l.productName,
        productCode: l.productCode,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        subtotal: l.lineTotal,
      })),
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  }
}
