import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap, finalize } from 'rxjs';
import {
  DebitNoteApiService,
  DebitNoteFilters,
} from '@features/finance/billing/debit-notes/services/api/debit-note-api.service';
import { DebitNoteMapper } from '@features/finance/billing/debit-notes/services/mappers/debit-note.mapper';
import {
  DebitNoteList,
  DebitNoteDetail,
  DebitNoteCreate,
} from '@features/finance/billing/debit-notes/models/interfaces/debit-note.interface';

@Injectable({ providedIn: 'root' })
export class DebitNoteApplicationService {
  private readonly api = inject(DebitNoteApiService);

  readonly debitNotes = signal<DebitNoteList[]>([]);
  readonly currentDebitNote = signal<DebitNoteDetail | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly totalElements = signal(0);

  loadDebitNotes(filters?: DebitNoteFilters): Observable<DebitNoteList[]> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.getAll(filters).pipe(
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

  loadDebitNoteById(id: string): Observable<DebitNoteDetail> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.getById(id).pipe(
      tap({
        next: (debitNote) => this.currentDebitNote.set(debitNote),
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  createDebitNote(data: DebitNoteCreate): Observable<DebitNoteDetail> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.create(data).pipe(
      tap({
        next: (debitNote) => {
          const listItem = DebitNoteMapper.toList(debitNote);
          this.debitNotes.update((current) => [listItem, ...current]);
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  deleteDebitNote(id: string): Observable<void> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.delete(id).pipe(
      tap({
        next: () => {
          this.debitNotes.update((current) => current.filter((c) => c.id !== id));
          if (this.currentDebitNote()?.id === id) {
            this.currentDebitNote.set(null);
          }
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }
}
