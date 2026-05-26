import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap, finalize } from 'rxjs';
import { PaymentMethodApiService, PaymentMethodFilters } from '../api/payment-method-api.service';
import { PaymentApiService, PaymentFilters } from '../api/payment-api.service';
import { CreditNoteApiService, CreditNoteFilters } from '../api/credit-note-api.service';
import { DebitNoteApiService, DebitNoteFilters } from '../api/debit-note-api.service';
import { ReturnApiService, ReturnFilters } from '../api/return-api.service';
import { PaymentMethodList, PaymentMethodDetail, PaymentMethodCreate, PaymentMethodUpdate, PaymentList, PaymentDetail, PaymentCreate, ApplyPayment, CreditNoteList, CreditNoteDetail, CreditNoteCreate, DebitNoteList, DebitNoteDetail, DebitNoteCreate, ReturnList, ReturnDetail, ReturnCreate } from '../../models/interfaces';
import { PagedResponse } from '@shared/models/interfaces/paged-response.interface';

@Injectable({ providedIn: 'root' })
export class FinanceApplicationService {
  private readonly paymentMethodApi = inject(PaymentMethodApiService);
  private readonly paymentApi = inject(PaymentApiService);
  private readonly creditNoteApi = inject(CreditNoteApiService);
  private readonly debitNoteApi = inject(DebitNoteApiService);
  private readonly returnApi = inject(ReturnApiService);

  readonly paymentMethods = signal<PaymentMethodList[]>([]);
  readonly currentPaymentMethod = signal<PaymentMethodDetail | null>(null);
  readonly payments = signal<PaymentList[]>([]);
  readonly selectedPayment = signal<PaymentDetail | null>(null);
  readonly creditNotes = signal<CreditNoteList[]>([]);
  readonly debitNotes = signal<DebitNoteList[]>([]);
  readonly returns = signal<ReturnList[]>([]);
  readonly selectedReturn = signal<ReturnDetail | null>(null);
  readonly currentDebitNote = signal<DebitNoteDetail | null>(null);
  readonly currentCreditNote = signal<CreditNoteDetail | null>(null);
  readonly loading = signal(false);
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

  deletePaymentMethod(id: string): Observable<void> {
    this.loading.set(true);
    this.error.set(null);

    return this.paymentMethodApi.delete(id).pipe(
      tap({
        next: () => {
          this.paymentMethods.update((current) => current.filter((c) => c.id !== id));
          if (this.currentPaymentMethod()?.id === id) {
            this.currentPaymentMethod.set(null);
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

  deleteCreditNote(id: string): Observable<void> {
    this.loading.set(true);
    this.error.set(null);

    return this.creditNoteApi.delete(id).pipe(
      tap({
        next: () => {
          this.creditNotes.update((current) => current.filter((n) => n.id !== id));
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

  deleteDebitNote(id: string): Observable<void> {
    this.loading.set(true);
    this.error.set(null);

    return this.debitNoteApi.delete(id).pipe(
      tap({
        next: () => {
          this.debitNotes.update((current) => current.filter((n) => n.id !== id));
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

  loadDebitNoteById(id: string): Observable<DebitNoteDetail> {
    this.loading.set(true);
    this.error.set(null);

    return this.debitNoteApi.getById(id).pipe(
      tap({
        next: (note) => this.currentDebitNote.set(note),
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  loadCreditNoteById(id: string): Observable<CreditNoteDetail> {
    this.loading.set(true);
    this.error.set(null);

    return this.creditNoteApi.getById(id).pipe(
      tap({
        next: (note) => this.currentCreditNote.set(note),
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }
}
