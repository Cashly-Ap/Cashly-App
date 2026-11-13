import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardSummary {
  monthlySales: number;
  monthlyExpenses: number;
  monthlyProfit: number;
  pendingOrders: number;
  pendingInvoices: number;
  overdueInvoices: number;
  overdueReceivables: number;
  lowStockProducts: number;
}

export interface MonthlySales {
  month: string;
  total: number;
}

export interface ProfitSummary {
  billing: number;
  expenses: number;
  net: number;
}

export interface TopItem {
  id: string;
  name: string;
  total: number;
}

export interface RecentActivity {
  type: string;
  id: string;
  number: string;
  customer: string;
  amount: number;
  created_at: string;
}

export interface InvoiceDue {
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  dueDate: string;
  amount: number;
}

export type DashboardPeriod = 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';

@Injectable({ providedIn: 'root' })
export class DashboardApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/dashboard';

  getSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.baseUrl}/summary`);
  }

  getMonthlySales(period: DashboardPeriod = 'MONTH'): Observable<MonthlySales[]> {
    return this.http.get<MonthlySales[]>(`${this.baseUrl}/monthly-sales`, {
      params: { period },
    });
  }

  getProfitSummary(period: DashboardPeriod = 'MONTH'): Observable<ProfitSummary> {
    return this.http.get<ProfitSummary>(`${this.baseUrl}/profit-summary`, {
      params: { period },
    });
  }

  getTopProducts(limit = 5): Observable<TopItem[]> {
    return this.http.get<TopItem[]>(`${this.baseUrl}/top-products`, { params: { limit } });
  }

  getTopCustomers(limit = 5): Observable<TopItem[]> {
    return this.http.get<TopItem[]>(`${this.baseUrl}/top-customers`, { params: { limit } });
  }

  getRecentActivity(): Observable<RecentActivity[]> {
    return this.http.get<RecentActivity[]>(`${this.baseUrl}/recent-activity`);
  }

  getInvoiceDueSchedule(scope: 'ALL' | 'UPCOMING' | 'OVERDUE' = 'ALL'): Observable<InvoiceDue[]> {
    return this.http.get<InvoiceDue[]>(`${this.baseUrl}/invoice-due-schedule`, {
      params: { scope },
    });
  }
}
