import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AdvanceList, AdvanceDetail, AdvanceCreate, AdvanceApply } from '../../models/interfaces';

export interface AdvanceFilters {
  dateFrom?: string;
  dateTo?: string;
  customerId?: string;
  status?: string;
}

interface AdvanceListApiResponse {
  id: string;
  advanceNumber: string;
  amount: number;
  remainingAmount: number;
  status: string;
  notes: string | null;
  createdAt: string;
}

interface AdvanceConsumptionApiResponse {
  id: string;
  advanceId: string;
  invoiceId: string;
  amount: number;
  paymentId: string | null;
  createdAt: string;
}

interface AdvanceDetailApiResponse {
  id: string;
  advanceNumber: string;
  customerId: string;
  amount: number;
  remainingAmount: number;
  status: string;
  notes: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  consumptions: AdvanceConsumptionApiResponse[];
}

@Injectable({ providedIn: 'root' })
export class AdvanceApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/advances';

  getAll(filters?: AdvanceFilters): Observable<AdvanceList[]> {
    let params = new HttpParams();
    if (filters?.dateFrom) params = params.set('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params = params.set('dateTo', filters.dateTo);
    if (filters?.customerId) params = params.set('customerId', filters.customerId);
    if (filters?.status) params = params.set('status', filters.status);
    return this.http.get<AdvanceListApiResponse[]>(this.baseUrl, { params })
      .pipe(map((items) => items.map((r) => this.toAdvanceList(r))));
  }

  getById(id: string): Observable<AdvanceDetail> {
    return this.http.get<AdvanceDetailApiResponse>(`${this.baseUrl}/${id}`)
      .pipe(map((r) => this.toAdvanceDetail(r)));
  }

  create(data: AdvanceCreate): Observable<AdvanceDetail> {
    return this.http.post<AdvanceDetailApiResponse>(this.baseUrl, data)
      .pipe(map((r) => this.toAdvanceDetail(r)));
  }

  apply(id: string, data: AdvanceApply): Observable<AdvanceDetail> {
    return this.http.post<AdvanceDetailApiResponse>(`${this.baseUrl}/${id}/apply`, data)
      .pipe(map((r) => this.toAdvanceDetail(r)));
  }

  cancel(id: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/cancel`, {});
  }

  private toAdvanceList(r: AdvanceListApiResponse): AdvanceList {
    return {
      id: r.id,
      advanceNumber: r.advanceNumber,
      amount: r.amount,
      remainingAmount: r.remainingAmount,
      status: r.status as AdvanceList['status'],
      notes: r.notes,
      createdAt: r.createdAt,
    };
  }

  private toAdvanceDetail(r: AdvanceDetailApiResponse): AdvanceDetail {
    return {
      id: r.id,
      advanceNumber: r.advanceNumber,
      customerId: r.customerId,
      amount: r.amount,
      remainingAmount: r.remainingAmount,
      status: r.status as AdvanceDetail['status'],
      notes: r.notes,
      createdBy: r.createdBy,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      consumptions: (r.consumptions ?? []).map((c) => ({
        id: c.id,
        advanceId: c.advanceId,
        invoiceId: c.invoiceId,
        amount: c.amount,
        paymentId: c.paymentId,
        createdAt: c.createdAt,
      })),
    };
  }
}
