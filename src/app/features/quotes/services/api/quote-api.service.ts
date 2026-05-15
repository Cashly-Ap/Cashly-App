import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  QuoteList,
  QuoteDetails,
  QuoteCreate,
  QuoteEdit,
  QuoteProduct,
  QuoteWarehouse,
} from '../../models/interfaces';
import { QuoteStatus } from '../../models/enums/quote-status.enum';

export interface QuoteProductFilters {
  customerId: string;
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

interface QuoteListApiResponse {
  id: string;
  quoteNumber: string;
  customerName: string;
  customerRif: string;
  status: string;
  expiryDate: string;
  subtotal: number;
  createdAt: string;
}

interface QuoteDetailApiResponse {
  id: string;
  quoteNumber: string;
  customerId: string;
  customerName: string;
  customerRif: string;
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
    unitPrice: number;
    subtotal: number;
    allocations: {
      warehouseId: string;
      warehouseName: string;
      warehouseCode?: string;
      allocatedQuantity: number;
    }[];
    warehouseStocks?: {
      warehouseId: string;
      warehouseName: string;
      available: number;
    }[];
  }[];
}

interface QuoteConvertedToOrderResponse {
  quoteId: string;
  quoteNumber: string;
  orderId: string;
  orderNumber: string;
}

interface QuoteConvertedToInvoiceResponse {
  quoteId: string;
  quoteNumber: string;
  invoiceId: string;
  invoiceNumber: string;
}

@Injectable({ providedIn: 'root' })
export class QuoteApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/quotes';

  getAll(): Observable<QuoteList[]> {
    return this.http
      .get<QuoteListApiResponse[]>(this.baseUrl)
      .pipe(map((items) => items.map((r) => this.toQuoteList(r))));
  }

  private toQuoteList(r: QuoteListApiResponse): QuoteList {
    return {
      id: r.id,
      quoteNumber: r.quoteNumber,
      customerName: r.customerName,
      customerRif: r.customerRif,
      status: r.status as QuoteStatus,
      subtotal: r.subtotal,
      expiryDate: r.expiryDate,
      createdAt: r.createdAt,
    };
  }

  getById(id: string): Observable<QuoteDetails> {
    return this.http.get<QuoteDetailApiResponse>(`${this.baseUrl}/${id}`).pipe(
      map((r) => this.toQuoteDetails(r)),
    );
  }

  create(data: QuoteCreate): Observable<QuoteDetails> {
    return this.http.post<QuoteDetailApiResponse>(this.baseUrl, data).pipe(
      map((r) => this.toQuoteDetails(r)),
    );
  }

  update(id: string, data: QuoteEdit): Observable<QuoteDetails> {
    return this.http.put<QuoteDetailApiResponse>(`${this.baseUrl}/${id}`, data).pipe(
      map((r) => this.toQuoteDetails(r)),
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  send(id: string): Observable<QuoteDetails> {
    return this.http.put<QuoteDetailApiResponse>(`${this.baseUrl}/${id}/send`, {}).pipe(
      map((r) => this.toQuoteDetails(r)),
    );
  }

  accept(id: string): Observable<QuoteDetails> {
    return this.http.put<QuoteDetailApiResponse>(`${this.baseUrl}/${id}/accept`, {}).pipe(
      map((r) => this.toQuoteDetails(r)),
    );
  }

  reject(id: string): Observable<QuoteDetails> {
    return this.http.put<QuoteDetailApiResponse>(`${this.baseUrl}/${id}/reject`, {}).pipe(
      map((r) => this.toQuoteDetails(r)),
    );
  }

  cancel(id: string, reason: string): Observable<QuoteDetails> {
    return this.http.put<QuoteDetailApiResponse>(`${this.baseUrl}/${id}/cancel`, { reason }).pipe(
      map((r) => this.toQuoteDetails(r)),
    );
  }

  getProductsForQuote(filters: QuoteProductFilters): Observable<PageResponse<QuoteProduct>> {
    let params = new HttpParams().set('customerId', filters.customerId);
    if (filters.search) params = params.set('search', filters.search);
    if (filters.categoryId) params = params.set('categoryId', filters.categoryId);
    if (filters.composite !== undefined) params = params.set('composite', String(filters.composite));
    if (filters.page !== undefined) params = params.set('page', String(filters.page));
    if (filters.size !== undefined) params = params.set('size', String(filters.size));
    return this.http.get<PageResponse<QuoteProduct>>(`${this.baseUrl}/products`, { params });
  }

  getWarehousesForQuote(customerId: string): Observable<QuoteWarehouse[]> {
    const params = new HttpParams().set('customerId', customerId);
    return this.http.get<QuoteWarehouse[]>(`${this.baseUrl}/warehouses`, { params });
  }

  convertToOrder(id: string): Observable<QuoteConvertedToOrderResponse> {
    return this.http.post<QuoteConvertedToOrderResponse>(`${this.baseUrl}/${id}/convert-to-order`, {});
  }

  convertToInvoice(id: string, paymentType: string): Observable<QuoteConvertedToInvoiceResponse> {
    return this.http.post<QuoteConvertedToInvoiceResponse>(`${this.baseUrl}/${id}/convert-to-invoice`, { paymentType });
  }

  private toQuoteDetails(r: QuoteDetailApiResponse): QuoteDetails {
    return {
      id: r.id,
      quoteNumber: r.quoteNumber,
      customerId: r.customerId,
      customerName: r.customerName,
      customerRif: r.customerRif,
      createdBy: r.createdBy,
      createdByName: r.createdByName,
      status: r.status as QuoteStatus,
      notes: r.notes,
      subtotal: r.subtotal,
      lines: r.lines.map((l) => ({
        id: l.id,
        productId: l.productId,
        productName: l.productName,
        productCode: l.productCode,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        subtotal: l.subtotal,
        allocations: (l.allocations ?? []).map((a) => ({
          warehouseId: a.warehouseId,
          warehouseName: a.warehouseName,
          warehouseCode: a.warehouseCode ?? '',
          allocatedQuantity: a.allocatedQuantity,
        })),
        warehouseStocks: l.warehouseStocks?.map((ws) => ({
          warehouseId: ws.warehouseId,
          warehouseName: ws.warehouseName,
          available: ws.available,
        })),
      })),
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  }
}
