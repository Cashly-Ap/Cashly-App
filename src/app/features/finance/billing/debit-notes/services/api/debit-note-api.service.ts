import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  DebitNoteList,
  DebitNoteDetail,
  DebitNoteCreate,
} from '@features/finance/billing/debit-notes/models/interfaces/debit-note.interface';

export interface DebitNoteFilters {
  search?: string;
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
  orderBy?: string;
  orderDir?: 'asc' | 'desc';
}

interface DebitNoteListApiResponse {
  id: string;
  noteNumber: string;
  customerId: string;
  customerName: string;
  invoiceNumber: string;
  amount: number;
  createdAt: string;
}

interface DebitNoteDetailApiResponse {
  id: string;
  noteNumber: string;
  customerId: string;
  customerName: string;
  customerRif: string;
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  reason: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class DebitNoteApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/debit-notes';

  getAll(filters?: DebitNoteFilters): Observable<DebitNoteList[]> {
    let params = new HttpParams();
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.customerId) params = params.set('customerId', filters.customerId);
    if (filters?.dateFrom) params = params.set('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params = params.set('dateTo', filters.dateTo);
    if (filters?.orderBy) params = params.set('orderBy', filters.orderBy);
    if (filters?.orderDir) params = params.set('orderDir', filters.orderDir);
    return this.http
      .get<DebitNoteListApiResponse[]>(this.baseUrl, { params })
      .pipe(map((items) => items.map((r) => this.toList(r))));
  }

  getById(id: string): Observable<DebitNoteDetail> {
    return this.http
      .get<DebitNoteDetailApiResponse>(`${this.baseUrl}/${id}`)
      .pipe(map((r) => this.toDetail(r)));
  }

  create(data: DebitNoteCreate): Observable<DebitNoteDetail> {
    return this.http
      .post<DebitNoteDetailApiResponse>(this.baseUrl, data)
      .pipe(map((r) => this.toDetail(r)));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  private toList(r: DebitNoteListApiResponse): DebitNoteList {
    return {
      id: r.id,
      noteNumber: r.noteNumber,
      customerId: r.customerId,
      customerName: r.customerName,
      invoiceNumber: r.invoiceNumber,
      amount: r.amount,
      createdAt: r.createdAt,
    };
  }

  private toDetail(r: DebitNoteDetailApiResponse): DebitNoteDetail {
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
