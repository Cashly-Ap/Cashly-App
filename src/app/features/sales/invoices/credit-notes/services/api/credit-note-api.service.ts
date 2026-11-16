import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DocumentListAction } from '@shared/models/document-list-action';
import { Observable, map } from 'rxjs';
import {
  CreditNoteList,
  CreditNoteDetail,
  CreditNoteCreate,
} from '@features/sales/invoices/credit-notes/models/interfaces/credit-note.interface';
import { PagedResponse } from '@shared/models/interfaces/paged-response.interface';

export interface CreditNoteFilters {
  action?: DocumentListAction;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  customerId?: string;
  orderBy?: string;
  orderDir?: 'asc' | 'desc';
  page?: number;
  size?: number;
}

interface CreditNoteListApiResponse {
  id: string;
  noteNumber: string;
  customerName: string | null;
  invoiceNumber: string | null;
  amount: number;
  reason: string;
  createdByName: string;
  createdAt: string;
}

interface CreditNoteDetailApiResponse {
  id: string;
  noteNumber: string;
  customerId: string;
  customerName: string | null;
  customerRif: string | null;
  invoiceId: string;
  invoiceNumber: string | null;
  amount: number;
  reason: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class CreditNoteApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/credit-notes';

  getAll(filters?: CreditNoteFilters): Observable<PagedResponse<CreditNoteList>> {
    let params = new HttpParams();
    if (filters?.action) params = params.set('action', filters.action);
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.dateFrom) params = params.set('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params = params.set('dateTo', filters.dateTo);
    if (filters?.customerId) params = params.set('customerId', filters.customerId);
    if (filters?.orderBy) params = params.set('orderBy', filters.orderBy);
    if (filters?.orderDir) params = params.set('orderDir', filters.orderDir);
    params = params.set('page', String(filters?.page ?? 0));
    params = params.set('size', String(filters?.size ?? 10));
    return this.http.get<PagedResponse<CreditNoteListApiResponse>>(this.baseUrl, { params }).pipe(
      map((response) => ({
        ...response,
        content: response.content.map((r) => this.toCreditNoteList(r)),
      })),
    );
  }

  getById(id: string): Observable<CreditNoteDetail> {
    return this.http
      .get<CreditNoteDetailApiResponse>(`${this.baseUrl}/${id}`)
      .pipe(map((r) => this.toCreditNoteDetail(r)));
  }

  create(data: CreditNoteCreate): Observable<CreditNoteDetail> {
    return this.http
      .post<CreditNoteDetailApiResponse>(this.baseUrl, data)
      .pipe(map((r) => this.toCreditNoteDetail(r)));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  private toCreditNoteList(r: CreditNoteListApiResponse): CreditNoteList {
    return {
      id: r.id,
      noteNumber: r.noteNumber,
      customerName: r.customerName,
      invoiceNumber: r.invoiceNumber,
      amount: r.amount,
      reason: r.reason,
      createdByName: r.createdByName,
      createdAt: r.createdAt,
    };
  }

  private toCreditNoteDetail(r: CreditNoteDetailApiResponse): CreditNoteDetail {
    return {
      id: r.id,
      noteNumber: r.noteNumber,
      customerId: r.customerId,
      customerName: r.customerName,
      customerRif: r.customerRif,
      invoiceId: r.invoiceId,
      invoiceNumber: r.invoiceNumber,
      amount: r.amount,
      reason: r.reason,
      createdBy: r.createdBy,
      createdByName: r.createdByName,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  }
}
