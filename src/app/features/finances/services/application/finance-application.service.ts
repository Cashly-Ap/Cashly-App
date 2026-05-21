import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap, finalize } from 'rxjs';
import { PaymentMethodApiService, PaymentMethodFilters } from '../api/payment-method-api.service';
import { PaymentApiService, PaymentFilters } from '../api/payment-api.service';
import { CreditApiService } from '../api/credit-api.service';
import { CreditNoteApiService, CreditNoteFilters } from '../api/credit-note-api.service';
import { DebitNoteApiService, DebitNoteFilters } from '../api/debit-note-api.service';
import { ReturnApiService, ReturnFilters } from '../api/return-api.service';
import { PaymentMethodList, PaymentMethodDetail, PaymentMethodCreate, PaymentMethodUpdate, PaymentList, PaymentDetail, PaymentCreate, ApplyPayment, CreditStatus, CustomerBalance, CreditNoteList, CreditNoteDetail, CreditNoteCreate, DebitNoteList, DebitNoteDetail, DebitNoteCreate, ReturnList, ReturnDetail, ReturnCreate } from '../../models/interfaces';
import { PagedResponse } from '@shared/models/interfaces/paged-response.interface';

@Injectable({ providedIn: 'root' })
export class FinanceApplicationService {
  private readonly paymentMethodApi = inject(PaymentMethodApiService);
  private readonly paymentApi = inject(PaymentApiService);
  private readonly creditApi = inject(CreditApiService);
  private readonly creditNoteApi = inject(CreditNoteApiService);
  private readonly debitNoteApi = inject(DebitNoteApiService);
  private readonly returnApi = inject(ReturnApiService);

  readonly paymentMethods = signal<PaymentMethodList[]>([]);
  readonly currentPaymentMethod = signal<PaymentMethodDetail | null>(null);
  readonly payments = signal<PaymentList[]>([]);
  readonly selectedPayment = signal<PaymentDetail | null>(null);
  readonly creditStatus = signal<CreditStatus | null>(null);
  readonly customerBalances = signal<CustomerBalance[]>([]);
  readonly creditNotes = signal<CreditNoteList[]>([]);
  readonly debitNotes = signal<DebitNoteList[]>([]);
  readonly returns = signal<ReturnList[]>([]);
  readonly selectedReturn = signal<ReturnDetail | null>(null);
  readonly loading = signal(false);
  readonly loadingCredit = signal(false);
  readonly error = signal<string | null>(null);
  readonly totalElements = signal(0);

  loadPaymentMethods(filters?: PaymentMethodFilters): Observable<PagedResponse<PaymentMethodList>> {
    this.loading.set(true);
    this.error.set(null);

    return this.paymentMethodApi.getAll(filters).pipe(
      tap({
        next: (res) => {
          this.paymentMethods.set(res.content ?? []);
          this.totalElements.set(res.totalElements ?? 0);
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  loadPaymentMethodById(id: string): Observable<PaymentMethodDetail> {
    this.loading.set(true);
    this.error.set(null);

    return this.paymentMethodApi.getById(id).pipe(
      tap({
        next: (paymentMethod) => this.currentPaymentMethod.set(paymentMethod),
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  createPaymentMethod(data: PaymentMethodCreate): Observable<PaymentMethodDetail> {
    this.loading.set(true);
    this.error.set(null);

    return this.paymentMethodApi.create(data).pipe(
      tap({
        next: (paymentMethod) => {
          const listItem: PaymentMethodList = {
            id: paymentMethod.id,
            code: paymentMethod.code,
            name: paymentMethod.name,
            description: paymentMethod.description,
            isActive: paymentMethod.isActive,
            createdAt: paymentMethod.createdAt,
          };
          this.paymentMethods.update((current) => [...current, listItem]);
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  updatePaymentMethod(id: string, data: PaymentMethodUpdate): Observable<PaymentMethodDetail> {
    this.loading.set(true);
    this.error.set(null);

    return this.paymentMethodApi.update(id, data).pipe(
      tap({
        next: (paymentMethod) => {
          const listItem: PaymentMethodList = {
            id: paymentMethod.id,
            code: paymentMethod.code,
            name: paymentMethod.name,
            description: paymentMethod.description,
            isActive: paymentMethod.isActive,
            createdAt: paymentMethod.createdAt,
          };
          this.paymentMethods.update((current) =>
            current.map((c) => (c.id === id ? listItem : c)),
          );
          if (this.currentPaymentMethod()?.id === id) {
            this.currentPaymentMethod.set(paymentMethod);
          }
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  togglePaymentMethod(id: string): Observable<PaymentMethodDetail> {
    this.loading.set(true);
    this.error.set(null);

    return this.paymentMethodApi.toggle(id).pipe(
      tap({
        next: (paymentMethod) => {
          this.paymentMethods.update((current) =>
            current.map((c) => (c.id === id ? { ...c, isActive: paymentMethod.isActive } : c)),
          );
          if (this.currentPaymentMethod()?.id === id) {
            this.currentPaymentMethod.set(paymentMethod);
          }
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  loadPayments(filters?: PaymentFilters): Observable<PaymentList[]> {
    this.loading.set(true);
    this.error.set(null);

    return this.paymentApi.getAll(filters).pipe(
      tap({
        next: (items) => {
          this.payments.set(items);
          this.totalElements.set(items.length);
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  loadPaymentById(id: string): Observable<PaymentDetail> {
    this.loading.set(true);
    this.error.set(null);

    return this.paymentApi.getById(id).pipe(
      tap({
        next: (payment) => this.selectedPayment.set(payment),
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  createPayment(data: PaymentCreate): Observable<PaymentDetail> {
    this.loading.set(true);
    this.error.set(null);

    return this.paymentApi.create(data).pipe(
      tap({
        next: (payment) => {
          const listItem: PaymentList = {
            id: payment.id,
            paymentNumber: payment.paymentNumber,
            customerId: payment.customerId,
            customerName: payment.customerName,
            type: payment.type,
            amount: payment.amount,
            paymentMethodName: payment.paymentMethodName,
            status: payment.status,
            appliedAmount: payment.appliedAmount,
            paymentDate: payment.paymentDate,
            createdAt: payment.createdAt,
          };
          this.payments.update((current) => [listItem, ...current]);
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  applyPayment(id: string, data: ApplyPayment): Observable<PaymentDetail> {
    this.loading.set(true);
    this.error.set(null);

    return this.paymentApi.apply(id, data).pipe(
      tap({
        next: (payment) => {
          const listItem: PaymentList = {
            id: payment.id,
            paymentNumber: payment.paymentNumber,
            customerId: payment.customerId,
            customerName: payment.customerName,
            type: payment.type,
            amount: payment.amount,
            paymentMethodName: payment.paymentMethodName,
            status: payment.status,
            appliedAmount: payment.appliedAmount,
            paymentDate: payment.paymentDate,
            createdAt: payment.createdAt,
          };
          this.payments.update((current) => current.map((p) => (p.id === id ? listItem : p)));
          if (this.selectedPayment()?.id === id) {
            this.selectedPayment.set(payment);
          }
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  cancelPayment(id: string, reason: string): Observable<PaymentDetail> {
    this.loading.set(true);
    this.error.set(null);

    return this.paymentApi.cancel(id, reason).pipe(
      tap({
        next: (payment) => {
          const listItem: PaymentList = {
            id: payment.id,
            paymentNumber: payment.paymentNumber,
            customerId: payment.customerId,
            customerName: payment.customerName,
            type: payment.type,
            amount: payment.amount,
            paymentMethodName: payment.paymentMethodName,
            status: payment.status,
            appliedAmount: payment.appliedAmount,
            paymentDate: payment.paymentDate,
            createdAt: payment.createdAt,
          };
          this.payments.update((current) => current.map((p) => (p.id === id ? listItem : p)));
          if (this.selectedPayment()?.id === id) {
            this.selectedPayment.set(payment);
          }
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  loadCreditStatus(customerId: string): Observable<CreditStatus> {
    this.loadingCredit.set(true);
    this.error.set(null);

    return this.creditApi.getCreditStatus(customerId).pipe(
      tap({
        next: (status) => this.creditStatus.set(status),
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loadingCredit.set(false)),
    );
  }

  checkAdvanceForCustomer(customerId: string): Observable<CustomerBalance[]> {
    return this.creditApi.getCustomerBalances().pipe(
      tap({
        next: (balances) => this.customerBalances.set(balances),
        error: (err: Error) => this.error.set(err.message),
      }),
    );
  }

  loadCreditNotes(filters?: CreditNoteFilters): Observable<CreditNoteList[]> {
    this.loading.set(true);
    this.error.set(null);

    return this.creditNoteApi.getAll(filters).pipe(
      tap({
        next: (items) => {
          this.creditNotes.set(items);
          this.totalElements.set(items.length);
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  createCreditNote(data: CreditNoteCreate): Observable<CreditNoteDetail> {
    this.loading.set(true);
    this.error.set(null);

    return this.creditNoteApi.create(data).pipe(
      tap({
        next: (note) => {
          const listItem: CreditNoteList = {
            id: note.id,
            noteNumber: note.noteNumber,
            customerId: note.customerId,
            customerName: note.customerName,
            invoiceNumber: note.invoiceNumber,
            amount: note.amount,
            status: note.status,
            appliedAmount: note.appliedAmount,
            createdAt: note.createdAt,
          };
          this.creditNotes.update((current) => [listItem, ...current]);
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  cancelCreditNote(id: string): Observable<CreditNoteDetail> {
    this.loading.set(true);
    this.error.set(null);

    return this.creditNoteApi.cancel(id).pipe(
      tap({
        next: (note) => {
          const listItem: CreditNoteList = {
            id: note.id,
            noteNumber: note.noteNumber,
            customerId: note.customerId,
            customerName: note.customerName,
            invoiceNumber: note.invoiceNumber,
            amount: note.amount,
            status: note.status,
            appliedAmount: note.appliedAmount,
            createdAt: note.createdAt,
          };
          this.creditNotes.update((current) => current.map((n) => (n.id === id ? listItem : n)));
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  loadDebitNotes(filters?: DebitNoteFilters): Observable<DebitNoteList[]> {
    this.loading.set(true);
    this.error.set(null);

    return this.debitNoteApi.getAll(filters).pipe(
      tap({
        next: (items) => {
          this.debitNotes.set(items);
          this.totalElements.set(items.length);
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  createDebitNote(data: DebitNoteCreate): Observable<DebitNoteDetail> {
    this.loading.set(true);
    this.error.set(null);

    return this.debitNoteApi.create(data).pipe(
      tap({
        next: (note) => {
          const listItem: DebitNoteList = {
            id: note.id,
            noteNumber: note.noteNumber,
            customerId: note.customerId,
            customerName: note.customerName,
            invoiceNumber: note.invoiceNumber,
            amount: note.amount,
            status: note.status,
            appliedAmount: note.appliedAmount,
            createdAt: note.createdAt,
          };
          this.debitNotes.update((current) => [listItem, ...current]);
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  cancelDebitNote(id: string): Observable<DebitNoteDetail> {
    this.loading.set(true);
    this.error.set(null);

    return this.debitNoteApi.cancel(id).pipe(
      tap({
        next: (note) => {
          const listItem: DebitNoteList = {
            id: note.id,
            noteNumber: note.noteNumber,
            customerId: note.customerId,
            customerName: note.customerName,
            invoiceNumber: note.invoiceNumber,
            amount: note.amount,
            status: note.status,
            appliedAmount: note.appliedAmount,
            createdAt: note.createdAt,
          };
          this.debitNotes.update((current) => current.map((n) => (n.id === id ? listItem : n)));
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  loadReturns(filters?: ReturnFilters): Observable<ReturnList[]> {
    this.loading.set(true);
    this.error.set(null);

    return this.returnApi.getAll(filters).pipe(
      tap({
        next: (items) => {
          this.returns.set(items);
          this.totalElements.set(items.length);
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  loadReturnById(id: string): Observable<ReturnDetail> {
    this.loading.set(true);
    this.error.set(null);

    return this.returnApi.getById(id).pipe(
      tap({
        next: (ret) => this.selectedReturn.set(ret),
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  createReturn(data: ReturnCreate): Observable<ReturnDetail> {
    this.loading.set(true);
    this.error.set(null);

    return this.returnApi.create(data).pipe(
      tap({
        next: (ret) => {
          const listItem: ReturnList = {
            id: ret.id,
            returnNumber: ret.returnNumber,
            invoiceNumber: ret.invoiceNumber,
            customerName: ret.customerName,
            returnType: ret.returnType,
            reason: ret.reason,
            status: ret.status,
            createdAt: ret.createdAt,
          };
          this.returns.update((current) => [listItem, ...current]);
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  cancelReturn(id: string): Observable<ReturnDetail> {
    this.loading.set(true);
    this.error.set(null);

    return this.returnApi.cancel(id).pipe(
      tap({
        next: (ret) => {
          const listItem: ReturnList = {
            id: ret.id,
            returnNumber: ret.returnNumber,
            invoiceNumber: ret.invoiceNumber,
            customerName: ret.customerName,
            returnType: ret.returnType,
            reason: ret.reason,
            status: ret.status,
            createdAt: ret.createdAt,
          };
          this.returns.update((current) => current.map((r) => (r.id === id ? listItem : r)));
          if (this.selectedReturn()?.id === id) {
            this.selectedReturn.set(ret);
          }
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }
}
