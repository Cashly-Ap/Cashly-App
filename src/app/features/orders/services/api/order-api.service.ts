import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { OrderList, OrderDetails, OrderCreate, OrderEdit, OrderProduct } from '@features/orders/models/interfaces';
import { OrderStatus } from '@features/orders/models/enums/order-status.enum';

export interface ConvertToInvoiceRequest {
  paymentType: string;
  confirmationPassword?: string;
  useBalance?: boolean;
  balanceAmount?: number;
  paymentMethodId?: string;
}

export interface OrderProductFilters {
  customerId: string;
  search?: string;
  categoryId?: string;
  composite?: boolean;
  withStock?: boolean;
  page?: number;
  size?: number;
}

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
}

export interface OrderFilters {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  customerId?: string;
  productId?: string;
  categoryId?: string;
  orderBy?: string;
  orderDir?: 'asc' | 'desc';
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
    warehouseAllocations?: {
      warehouseId: string;
      warehouseCode: string;
      warehouseName: string;
      availableStock: number;
      allocated: number;
    }[];
    warehouseStocks?: {
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
export class OrderApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/orders';

  getAll(filters?: OrderFilters): Observable<OrderList[]> {
    let params = new HttpParams();
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.dateFrom) params = params.set('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params = params.set('dateTo', filters.dateTo);
    if (filters?.customerId) params = params.set('customerId', filters.customerId);
    if (filters?.productId) params = params.set('productId', filters.productId);
    if (filters?.categoryId) params = params.set('categoryId', filters.categoryId);
    if (filters?.orderBy) params = params.set('orderBy', filters.orderBy);
    if (filters?.orderDir) params = params.set('orderDir', filters.orderDir);
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

  convertToInvoice(id: string, request: ConvertToInvoiceRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/convert-to-invoice`, request);
  }

  cancel(id: string, reason: string): Observable<OrderDetails> {
    return this.http.put<OrderDetailApiResponse>(`${this.baseUrl}/${id}/cancel`, { reason }).pipe(
      map((r) => this.toOrderDetails(r)),
    );
  }

  getProductsForOrder(filters: OrderProductFilters): Observable<PageResponse<OrderProduct>> {
    let params = new HttpParams().set('customerId', filters.customerId);
    if (filters.search) params = params.set('search', filters.search);
    if (filters.categoryId) params = params.set('categoryId', filters.categoryId);
    if (filters.composite !== undefined) params = params.set('composite', String(filters.composite));
    if (filters.withStock !== undefined) params = params.set('withStock', String(filters.withStock));
    if (filters.page !== undefined) params = params.set('page', String(filters.page));
    if (filters.size !== undefined) params = params.set('size', String(filters.size));
    return this.http.get<PageResponse<OrderProduct>>(`${this.baseUrl}/products`, { params });
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
        warehouseAllocations: (l.warehouseAllocations ?? []).map((a) => ({
          warehouseId: a.warehouseId,
          warehouseCode: a.warehouseCode,
          warehouseName: a.warehouseName,
          available: a.availableStock,
          allocated: a.allocated,
        })),
        warehouseStocks: (l.warehouseStocks ?? []).map((s) => ({
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
