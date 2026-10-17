import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap, finalize } from 'rxjs';
import {
  CreditNoteApiService,
  CreditNoteFilters,
} from '@features/finance/billing/credit-notes/services/api/credit-note-api.service';
import { CreditNoteMapper } from '@features/finance/billing/credit-notes/services/mappers/credit-note.mapper';
import {
  CreditNoteList,
  CreditNoteDetail,
  CreditNoteCreate,
} from '@features/finance/billing/credit-notes/models/interfaces/credit-note.interface';

@Injectable({ providedIn: 'root' })
export class CreditNoteApplicationService {
  private readonly api = inject(CreditNoteApiService);

  readonly creditNotes = signal<CreditNoteList[]>([]);
  readonly currentCreditNote = signal<CreditNoteDetail | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly totalElements = signal(0);

  loadCreditNotes(filters?: CreditNoteFilters): Observable<CreditNoteList[]> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.getAll(filters).pipe(
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

  loadCreditNoteById(id: string): Observable<CreditNoteDetail> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.getById(id).pipe(
      tap({
        next: (creditNote) => this.currentCreditNote.set(creditNote),
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  createCreditNote(data: CreditNoteCreate): Observable<CreditNoteDetail> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.create(data).pipe(
      tap({
        next: (creditNote) => {
          const listItem = CreditNoteMapper.toList(creditNote);
          this.creditNotes.update((current) => [listItem, ...current]);
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  deleteCreditNote(id: string): Observable<void> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.delete(id).pipe(
      tap({
        next: () => {
          this.creditNotes.update((current) => current.filter((c) => c.id !== id));
          if (this.currentCreditNote()?.id === id) {
            this.currentCreditNote.set(null);
          }
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }
}
