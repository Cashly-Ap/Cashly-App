import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { DebitNoteList, DebitNoteDetail, DebitNoteCreate } from '../../models/interfaces';

export interface DebitNoteFilters {
  search?: string;
  customerId?: string;
  status?: string;
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
  status: string;
  appliedAmount: number;
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
  appliedAmount: number;
  remainingAmount: number;
  status: string;
  reason: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class DebitNoteApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/finances/debit-notes';

  getAll(filters?: DebitNoteFilters): Observable<DebitNoteList[]> {
    let params = new HttpParams();
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.customerId) params = params.set('customerId', filters.customerId);
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.dateFrom) params = params.set('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params = params.set('dateTo', filters.dateTo);
    if (filters?.orderBy) params = params.set('orderBy', filters.orderBy);
    if (filters?.orderDir) params = params.set('orderDir', filters.orderDir);
    return this.http
      .get<DebitNoteListApiResponse[]>(this.baseUrl, { params })
      .pipe(map((items) => items.map((r) => this.toList(r))));
  }

  getById(id: string): Observable<DebitNoteDetail> {
    return this.http.get<DebitNoteDetailApiResponse>(`${this.baseUrl}/${id}`).pipe(
      map((r) => this.toDetail(r)),
    );
  }

  create(data: DebitNoteCreate): Observable<DebitNoteDetail> {
    return this.http.post<DebitNoteDetailApiResponse>(this.baseUrl, data).pipe(
      map((r) => this.toDetail(r)),
    );
  }

  apply(id: string, invoiceId: string, amount: number): Observable<DebitNoteDetail> {
    return this.http.put<DebitNoteDetailApiResponse>(`${this.baseUrl}/${id}/apply`, { invoiceId, amount }).pipe(
      map((r) => this.toDetail(r)),
    );
  }

  cancel(id: string): Observable<DebitNoteDetail> {
    return this.http.put<DebitNoteDetailApiResponse>(`${this.baseUrl}/${id}/cancel`, {}).pipe(
      map((r) => this.toDetail(r)),
    );
  }

  private toList(r: DebitNoteListApiResponse): DebitNoteList {
    return {
      id: r.id,
      noteNumber: r.noteNumber,
      customerId: r.customerId,
      customerName: r.customerName,
      invoiceNumber: r.invoiceNumber,
      amount: r.amount,
      status: r.status,
      appliedAmount: r.appliedAmount,
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
      appliedAmount: r.appliedAmount,
      remainingAmount: r.remainingAmount,
      status: r.status,
      reason: r.reason,
      createdBy: r.createdBy,
      createdByName: r.createdByName,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  }
}
