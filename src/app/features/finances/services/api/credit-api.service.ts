import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { CreditStatus, CustomerBalance } from '../../models/interfaces';

interface CreditStatusApiResponse {
  customerId: string;
  customerName: string;
  customerRif: string;
  creditLimit: number;
  pendingBalance: number;
  unconsumedAdvances: number;
  availableCredit: number;
  overdueInvoices: {
    invoiceNumber: string;
    amount: number;
    dueDate: string;
    daysOverdue: number;
  }[];
  advances: {
    paymentNumber: string;
    amount: number;
    remainingAmount: number;
    date: string;
  }[];
  hasOverdue: boolean;
  canCreateCreditInvoice: boolean;
}

interface CustomerBalanceApiResponse {
  customerId: string;
  customerName: string;
  pendingBalance: number;
  availableCredit: number;
}

@Injectable({ providedIn: 'root' })
export class CreditApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/finances/credit';

  getCreditStatus(customerId: string): Observable<CreditStatus> {
    return this.http
      .get<CreditStatusApiResponse>(`${this.baseUrl}/status/${customerId}`)
      .pipe(map((r) => this.toCreditStatus(r)));
  }

  getOverdueInvoices(): Observable<CreditStatus['overdueInvoices']> {
    return this.http
      .get<CreditStatusApiResponse['overdueInvoices']>(`${this.baseUrl}/overdue`)
      .pipe(map((items) => items.map((r) => this.toOverdueInvoice(r))));
  }

  getCustomerBalances(): Observable<CustomerBalance[]> {
    return this.http
      .get<CustomerBalanceApiResponse[]>(`${this.baseUrl}/balances`)
      .pipe(map((items) => items.map((r) => this.toCustomerBalance(r))));
  }

  private toCreditStatus(r: CreditStatusApiResponse): CreditStatus {
    return {
      customerId: r.customerId,
      customerName: r.customerName,
      customerRif: r.customerRif,
      creditLimit: r.creditLimit,
      pendingBalance: r.pendingBalance,
      unconsumedAdvances: r.unconsumedAdvances,
      availableCredit: r.availableCredit,
      overdueInvoices: r.overdueInvoices.map((i) => this.toOverdueInvoice(i)),
      advances: r.advances.map((a) => this.toAdvanceInfo(a)),
      hasOverdue: r.hasOverdue,
      canCreateCreditInvoice: r.canCreateCreditInvoice,
    };
  }

  private toOverdueInvoice(r: CreditStatusApiResponse['overdueInvoices'][0]): CreditStatus['overdueInvoices'][0] {
    return {
      invoiceNumber: r.invoiceNumber,
      amount: r.amount,
      dueDate: r.dueDate,
      daysOverdue: r.daysOverdue,
    };
  }

  private toAdvanceInfo(r: CreditStatusApiResponse['advances'][0]): CreditStatus['advances'][0] {
    return {
      paymentNumber: r.paymentNumber,
      amount: r.amount,
      remainingAmount: r.remainingAmount,
      date: r.date,
    };
  }

  private toCustomerBalance(r: CustomerBalanceApiResponse): CustomerBalance {
    return {
      customerId: r.customerId,
      customerName: r.customerName,
      pendingBalance: r.pendingBalance,
      availableCredit: r.availableCredit,
    };
  }
}
