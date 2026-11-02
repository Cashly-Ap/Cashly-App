import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DocumentListAction } from '@shared/models/document-list-action';
import { Observable, map } from 'rxjs';
import {
  CreditNoteList,
  CreditNoteDetail,
  CreditNoteCreate,
} from '@features/finance/billing/credit-notes/models/interfaces/credit-note.interface';

export interface CreditNoteFilters {
  action?: DocumentListAction;
  dateFrom?: string;
  dateTo?: string;
  customerId?: string;
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

  getAll(filters?: CreditNoteFilters): Observable<CreditNoteList[]> {
    let params = new HttpParams();
    if (filters?.action) params = params.set('action', filters.action);
    if (filters?.dateFrom) params = params.set('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params = params.set('dateTo', filters.dateTo);
    if (filters?.customerId) params = params.set('customerId', filters.customerId);
    return this.http
      .get<CreditNoteListApiResponse[]>(this.baseUrl, { params })
      .pipe(map((items) => items.map((r) => this.toCreditNoteList(r))));
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
