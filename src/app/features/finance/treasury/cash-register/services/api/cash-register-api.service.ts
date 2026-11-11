import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { PagedResponse } from '@shared/models/interfaces/paged-response.interface';
import {
  CashRegisterReportFilters,
  ReportType,
} from '@features/finance/treasury/cash-register/reporting/models/interfaces';
import {
  CashRegisterResponse,
  OpenRegisterRequest,
  CloseRegisterRequest,
  CashRegisterHistoryView,
  CashRegisterReportFormat,
  CashMovementRequest,
  CashMovementResponse,
  CashMovementCancelRequest,
} from '@features/finance/treasury/cash-register/models/interfaces/closure.interface';

@Injectable({ providedIn: 'root' })
export class CashRegisterApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/cash-register`;

  open(request: OpenRegisterRequest): Observable<CashRegisterResponse> {
    return this.http.post<CashRegisterResponse>(`${this.baseUrl}/open`, request);
  }

  getActive(): Observable<CashRegisterResponse> {
    return this.http.get<CashRegisterResponse>(`${this.baseUrl}/active`);
  }

  close(id: string, request: CloseRegisterRequest): Observable<CashRegisterResponse> {
    return this.http.post<CashRegisterResponse>(`${this.baseUrl}/${id}/close`, request);
  }

  addMovement(id: string, request: CashMovementRequest): Observable<CashMovementResponse> {
    return this.http.post<CashMovementResponse>(`${this.baseUrl}/${id}/movements`, request);
  }

  deleteMovement(movementId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/movements/${movementId}`);
  }

  cancelMovement(
    movementId: string,
    request: CashMovementCancelRequest,
  ): Observable<CashMovementResponse> {
    return this.http.post<CashMovementResponse>(
      `${this.baseUrl}/movements/${movementId}/cancel`,
      request,
    );
  }

  getHistory(
    page: number,
    size: number,
    dateFrom?: string,
    dateTo?: string,
    sort?: string,
    view: CashRegisterHistoryView = 'SIMPLE',
  ): Observable<PagedResponse<CashRegisterResponse>> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    if (dateFrom) params = params.set('dateFrom', dateFrom);
    if (dateTo) params = params.set('dateTo', dateTo);
    if (sort) params = params.set('sort', sort);
    params = params.set('detailed', String(view === 'DETAILED'));
    return this.http.get<PagedResponse<CashRegisterResponse>>(`${this.baseUrl}/history`, {
      params,
    });
  }

  exportSession(
    id: string,
    format: CashRegisterReportFormat,
    type: CashRegisterHistoryView,
  ): Observable<Blob> {
    const params = new HttpParams().set('format', format).set('type', type);
    return this.http.get(`${this.baseUrl}/${id}/report`, { params, responseType: 'blob' });
  }

  exportExcel(dateFrom: string, dateTo: string, type: ReportType = 'DETAILED'): Observable<Blob> {
    const params = new HttpParams()
      .set('dateFrom', dateFrom)
      .set('dateTo', dateTo)
      .set('type', type);
    return this.http.get(`${this.baseUrl}/export`, {
      params,
      responseType: 'blob',
    });
  }

  exportReport(filters: CashRegisterReportFilters): Observable<Blob> {
    let params = new HttpParams()
      .set('dateFrom', filters.dateFrom)
      .set('dateTo', filters.dateTo)
      .set('format', filters.format)
      .set('type', filters.type);
    if (filters.customerId) params = params.set('customerId', filters.customerId);
    if (filters.productId) params = params.set('productId', filters.productId);
    if (filters.categoryId) params = params.set('categoryId', filters.categoryId);
    return this.http.get(`${this.baseUrl}/reports`, { params, responseType: 'blob' });
  }
}
