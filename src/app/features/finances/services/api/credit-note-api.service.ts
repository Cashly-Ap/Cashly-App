import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { CreditNoteList, CreditNoteDetail, CreditNoteCreate } from '../../models/interfaces';

export interface CreditNoteFilters {
  search?: string;
  customerId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  orderBy?: string;
  orderDir?: 'asc' | 'desc';
}

interface CreditNoteListApiResponse {
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

interface CreditNoteDetailApiResponse {
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
export class CreditNoteApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/finances/credit-notes';

  getAll(filters?: CreditNoteFilters): Observable<CreditNoteList[]> {
    let params = new HttpParams();
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.customerId) params = params.set('customerId', filters.customerId);
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.dateFrom) params = params.set('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params = params.set('dateTo', filters.dateTo);
    if (filters?.orderBy) params = params.set('orderBy', filters.orderBy);
    if (filters?.orderDir) params = params.set('orderDir', filters.orderDir);
    return this.http
      .get<CreditNoteListApiResponse[]>(this.baseUrl, { params })
      .pipe(map((items) => items.map((r) => this.toList(r))));
  }

  getById(id: string): Observable<CreditNoteDetail> {
    return this.http.get<CreditNoteDetailApiResponse>(`${this.baseUrl}/${id}`).pipe(
      map((r) => this.toDetail(r)),
    );
  }

  create(data: CreditNoteCreate): Observable<CreditNoteDetail> {
    return this.http.post<CreditNoteDetailApiResponse>(this.baseUrl, data).pipe(
      map((r) => this.toDetail(r)),
    );
  }

  apply(id: string, invoiceId: string, amount: number): Observable<CreditNoteDetail> {
    return this.http.put<CreditNoteDetailApiResponse>(`${this.baseUrl}/${id}/apply`, { invoiceId, amount }).pipe(
      map((r) => this.toDetail(r)),
    );
  }

  cancel(id: string): Observable<CreditNoteDetail> {
    return this.http.put<CreditNoteDetailApiResponse>(`${this.baseUrl}/${id}/cancel`, {}).pipe(
      map((r) => this.toDetail(r)),
    );
  }

  private toList(r: CreditNoteListApiResponse): CreditNoteList {
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

  private toDetail(r: CreditNoteDetailApiResponse): CreditNoteDetail {
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
