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
} from '@features/quotes/models/interfaces';
import { QuoteStatus } from '@features/quotes/models/enums/quote-status.enum';

export interface ConvertToInvoiceRequest {
  paymentType: string;
  confirmationPassword?: string;
  useBalance?: boolean;
  balanceAmount?: number;
  paymentMethodId?: string;
}

export interface AssignQuoteWarehousesRequest {
  lines: {
    lineId: string;
    allocations: {
      warehouseId: string;
      allocatedQuantity: number;
    }[];
  }[];
}

export interface QuoteProductFilters {
  customerId: string;
  search?: string;
  categoryId?: string;
  composite?: boolean;
  page?: number;
  size?: number;
}

export interface QuoteFilters {
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
  createdBy: string | null;
  createdByName: string | null;
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

  getAll(filters?: QuoteFilters): Observable<QuoteList[]> {
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
      .get<QuoteListApiResponse[]>(this.baseUrl, { params })
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
      createdBy: r.createdBy ?? null,
      createdByName: r.createdByName ?? null,
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

  getProductsForQuote(filters: QuoteProductFilters): Observable<PageResponse<QuoteProduct>> {
    let params = new HttpParams().set('customerId', filters.customerId);
    if (filters.search) params = params.set('search', filters.search);
    if (filters.categoryId) params = params.set('categoryId', filters.categoryId);
    if (filters.composite !== undefined) params = params.set('composite', String(filters.composite));
    if (filters.page !== undefined) params = params.set('page', String(filters.page));
    if (filters.size !== undefined) params = params.set('size', String(filters.size));
    return this.http.get<PageResponse<QuoteProduct>>('/api/products', { params });
  }

  getWarehousesForQuote(customerId: string): Observable<QuoteWarehouse[]> {
    const params = new HttpParams().set('customerId', customerId);
    return this.http.get<QuoteWarehouse[]>(`${this.baseUrl}/warehouses`, { params });
  }

  assignWarehouses(id: string, request: AssignQuoteWarehousesRequest): Observable<QuoteDetails> {
    return this.http.put<QuoteDetailApiResponse>(`${this.baseUrl}/${id}/allocations`, request).pipe(
      map((r) => this.toQuoteDetails(r)),
    );
  }

  convertToOrder(id: string): Observable<QuoteConvertedToOrderResponse> {
    return this.http.post<QuoteConvertedToOrderResponse>(`${this.baseUrl}/${id}/convert-to-order`, {});
  }

  convertToInvoice(id: string, request: ConvertToInvoiceRequest): Observable<QuoteConvertedToInvoiceResponse> {
    return this.http.post<QuoteConvertedToInvoiceResponse>(`${this.baseUrl}/${id}/convert-to-invoice`, request);
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
