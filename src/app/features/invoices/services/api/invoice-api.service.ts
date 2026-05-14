import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { InvoiceList, InvoiceDetails, InvoiceCreate, InvoiceUpdate } from '../../models/interfaces';
import { InvoiceStatus } from '../../models/enums/invoice-status.enum';
import { PaymentType } from '../../models/enums/payment-type.enum';

export interface InvoiceFilters {
  search?: string;
  status?: string;
  customerId?: string;
  paymentType?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface InvoiceListApiResponse {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  status: string;
  paymentType: string;
  subtotal: number;
  lineCount: number;
  orderId: string | null;
  orderNumber: string | null;
  createdAt: string;
}

interface InvoiceDetailApiResponse {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerRif: string;
  createdBy: string;
  createdByName: string;
  orderId: string | null;
  orderNumber: string | null;
  status: string;
  paymentType: string;
  notes: string | null;
  subtotal: number;
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
    warehouseAllocations: {
      id: string;
      warehouseId: string;
      warehouseCode: string;
      warehouseName: string;
      available: number;
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
export class InvoiceApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/invoices';

  getAll(filters?: InvoiceFilters): Observable<InvoiceList[]> {
    let params = new HttpParams();
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.customerId) params = params.set('customerId', filters.customerId);
    if (filters?.paymentType) params = params.set('paymentType', filters.paymentType);
    if (filters?.dateFrom) params = params.set('fromDate', filters.dateFrom);
    if (filters?.dateTo) params = params.set('toDate', filters.dateTo);
    return this.http
      .get<InvoiceListApiResponse[]>(this.baseUrl, { params })
      .pipe(map((items) => items.map((r) => this.toInvoiceList(r))));
  }

  private toInvoiceList(r: InvoiceListApiResponse): InvoiceList {
    return {
      id: r.id,
      invoiceNumber: r.invoiceNumber,
      customerId: r.customerId,
      customerName: r.customerName,
      status: r.status as InvoiceStatus,
      paymentType: r.paymentType as PaymentType,
      subtotal: r.subtotal,
      lineCount: r.lineCount,
      orderId: r.orderId,
      orderNumber: r.orderNumber,
      createdAt: r.createdAt,
    };
  }

  getById(id: string): Observable<InvoiceDetails> {
    return this.http.get<InvoiceDetailApiResponse>(`${this.baseUrl}/${id}`).pipe(
      map((r) => this.toInvoiceDetails(r)),
    );
  }

  create(data: InvoiceCreate): Observable<InvoiceDetails> {
    return this.http.post<InvoiceDetailApiResponse>(this.baseUrl, data).pipe(
      map((r) => this.toInvoiceDetails(r)),
    );
  }

  update(id: string, data: InvoiceUpdate): Observable<InvoiceDetails> {
    return this.http.put<InvoiceDetailApiResponse>(`${this.baseUrl}/${id}`, data).pipe(
      map((r) => this.toInvoiceDetails(r)),
    );
  }

  cancel(id: string, reason: string): Observable<InvoiceDetails> {
    return this.http.put<InvoiceDetailApiResponse>(`${this.baseUrl}/${id}/cancel`, { reason }).pipe(
      map((r) => this.toInvoiceDetails(r)),
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  confirm(id: string): Observable<InvoiceDetails> {
    return this.http.put<InvoiceDetailApiResponse>(`${this.baseUrl}/${id}/confirm`, {}).pipe(
      map((r) => this.toInvoiceDetails(r)),
    );
  }

  duplicate(id: string): Observable<InvoiceDetails> {
    return this.http.post<InvoiceDetailApiResponse>(`${this.baseUrl}/${id}/duplicate`, {}).pipe(
      map((r) => this.toInvoiceDetails(r)),
    );
  }

  private toInvoiceDetails(r: InvoiceDetailApiResponse): InvoiceDetails {
    return {
      id: r.id,
      invoiceNumber: r.invoiceNumber,
      customerId: r.customerId,
      customerName: r.customerName,
      customerRif: r.customerRif,
      createdBy: r.createdBy,
      createdByName: r.createdByName,
      orderId: r.orderId,
      orderNumber: r.orderNumber,
      status: r.status as InvoiceStatus,
      paymentType: r.paymentType as PaymentType,
      notes: r.notes,
      subtotal: r.subtotal,
      cancelledAt: r.cancelledAt,
      cancelledReason: r.cancelledReason,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      lines: r.lines.map((l) => ({
        id: l.id,
        productId: l.productId,
        productName: l.productName,
        productCode: l.productCode,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        lineTotal: l.lineTotal,
        warehouseAllocations: l.warehouseAllocations.map((a) => ({
          id: a.id,
          warehouseId: a.warehouseId,
          warehouseCode: a.warehouseCode,
          warehouseName: a.warehouseName,
          available: a.available,
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
    };
  }
}