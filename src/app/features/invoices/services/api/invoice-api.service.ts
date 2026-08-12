import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  InvoiceList,
  InvoiceDetails,
  InvoiceCreate,
  InvoiceUpdate,
  NoteInfo,
} from '@features/invoices/models/interfaces';
import { InvoiceStatus } from '@features/invoices/models/enums/invoice-status.enum';
import { PaymentType } from '@features/invoices/models/enums/payment-type.enum';

export interface InvoiceFilters {
  search?: string;
  statuses?: string[];
  returnStatus?: string[];
  customerId?: string;
  paymentType?: string;
  dateFrom?: string;
  dateTo?: string;
  orderBy?: string;
  orderDir?: 'asc' | 'desc';
}

interface InvoiceListApiResponse {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  status: string;
  statusLabel: string;
  paymentType: string;
  subtotal: number;
  total: number;
  paidAmount: number;
  creditApplied: number;
  debitApplied: number;
  lineCount: number;
  orderId: string | null;
  orderNumber: string | null;
  createdAt: string;
  returnedTotal: number;
  returnStatus: string | null;
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
  statusLabel: string;
  paymentType: string;
  notes: string | null;
  subtotal: number;
  creditApplied: number;
  debitApplied: number;
  total: number;
  notesList: {
    id: string;
    type: string;
    amount: number;
    reason: string;
    applicationDate: string;
  }[];
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
    returnedQuantity: number;
  }[];
  returnedTotal: number;
  returnStatus: string | null;
  returns: {
    id: string;
    returnNumber: string;
    returnType: string;
    reason: string;
    total: number;
    createdAt: string;
    createdByName: string;
    lines: {
      productId: string;
      productName: string;
      productCode: string;
      quantity: number;
      unitPrice: number;
      subtotal: number;
      allocations: {
        warehouseId: string;
        warehouseName: string;
        allocated: number;
      }[];
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
    if (filters?.statuses && filters.statuses.length > 0) {
      filters.statuses.forEach((s) => (params = params.append('status', s)));
    }
    if (filters?.returnStatus && filters.returnStatus.length > 0) {
      filters.returnStatus.forEach((s) => (params = params.append('returnStatus', s)));
    }
    if (filters?.customerId) params = params.set('customerId', filters.customerId);
    if (filters?.paymentType) params = params.set('paymentType', filters.paymentType);
    if (filters?.dateFrom) params = params.set('fromDate', filters.dateFrom);
    if (filters?.dateTo) params = params.set('toDate', filters.dateTo);
    if (filters?.orderBy) params = params.set('orderBy', filters.orderBy);
    if (filters?.orderDir) params = params.set('orderDir', filters.orderDir);
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
      statusLabel: r.statusLabel,
      paymentType: r.paymentType as PaymentType,
      subtotal: r.subtotal,
      total: r.total,
      paidAmount: r.paidAmount,
      creditApplied: r.creditApplied ?? 0,
      debitApplied: r.debitApplied ?? 0,
      lineCount: r.lineCount,
      orderId: r.orderId,
      orderNumber: r.orderNumber,
      createdAt: r.createdAt,
      returnStatus: r.returnStatus as 'PARTIAL' | 'FULL' | null,
    };
  }

  getById(id: string): Observable<InvoiceDetails> {
    return this.http
      .get<InvoiceDetailApiResponse>(`${this.baseUrl}/${id}`)
      .pipe(map((r) => this.toInvoiceDetails(r)));
  }

  create(data: InvoiceCreate): Observable<InvoiceDetails> {
    return this.http
      .post<InvoiceDetailApiResponse>(this.baseUrl, data)
      .pipe(map((r) => this.toInvoiceDetails(r)));
  }

  update(id: string, data: InvoiceUpdate): Observable<InvoiceDetails> {
    return this.http
      .put<InvoiceDetailApiResponse>(`${this.baseUrl}/${id}`, data)
      .pipe(map((r) => this.toInvoiceDetails(r)));
  }

  cancel(id: string, reason: string): Observable<InvoiceDetails> {
    return this.http
      .put<InvoiceDetailApiResponse>(`${this.baseUrl}/${id}/cancel`, { reason })
      .pipe(map((r) => this.toInvoiceDetails(r)));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  confirm(
    id: string,
    data?: {
      confirmationPassword?: string;
      useBalance?: boolean;
      balanceAmount?: number;
      paymentMethodId?: string;
    },
  ): Observable<InvoiceDetails> {
    return this.http
      .put<InvoiceDetailApiResponse>(`${this.baseUrl}/${id}/confirm`, data ?? {})
      .pipe(map((r) => this.toInvoiceDetails(r)));
  }

  duplicate(id: string, customerId?: string): Observable<InvoiceDetails> {
    const body = customerId ? { customerId } : {};
    return this.http
      .post<InvoiceDetailApiResponse>(`${this.baseUrl}/${id}/duplicate`, body)
      .pipe(map((r) => this.toInvoiceDetails(r)));
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
      statusLabel: r.statusLabel,
      notes: r.notes,
      paymentType: r.paymentType as PaymentType,
      subtotal: r.subtotal,
      creditApplied: r.creditApplied ?? 0,
      debitApplied: r.debitApplied ?? 0,
      total: r.total ?? r.subtotal,
      notesList: (r.notesList ?? []).map((n) => ({
        id: n.id,
        type: n.type as 'CREDIT' | 'DEBIT',
        amount: n.amount,
        reason: n.reason,
        applicationDate: n.applicationDate,
      })),
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
        returnedQuantity: l.returnedQuantity ?? 0,
      })),
      returnedTotal: r.returnedTotal ?? 0,
      returnStatus: r.returnStatus as 'PARTIAL' | 'FULL' | null,
      returns: (r.returns ?? []).map((ret) => ({
        id: ret.id,
        returnNumber: ret.returnNumber,
        returnType: ret.returnType as 'AUTOMATIC' | 'MANUAL',
        reason: ret.reason,
        total: ret.total,
        createdAt: ret.createdAt,
        createdByName: ret.createdByName,
        lines: ret.lines.map((line) => ({
          productId: line.productId,
          productName: line.productName,
          productCode: line.productCode,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          subtotal: line.subtotal,
          allocations: line.allocations.map((a) => ({
            warehouseId: a.warehouseId,
            warehouseName: a.warehouseName,
            allocated: a.allocated,
          })),
        })),
      })),
    };
  }
}
