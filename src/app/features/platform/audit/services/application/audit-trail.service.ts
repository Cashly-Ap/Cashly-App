import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, finalize, tap } from 'rxjs';
import { PagedResponse } from '@shared/models/interfaces/paged-response.interface';
import {
  AuditEvent,
  AuditFilterOptions,
  AuditFilters,
  AuditTrailRequest,
} from '@features/platform/audit/models';
import { AuditApiService } from '@features/platform/audit/services/api';

const DEFAULT_PAGE_SIZE = 20;

const INITIAL_FILTERS: AuditFilters = {
  page: 0,
  size: DEFAULT_PAGE_SIZE,
};

@Injectable({ providedIn: 'root' })
export class AuditTrailService {
  private readonly api = inject(AuditApiService);

  readonly events = signal<AuditEvent[]>([]);
  readonly filterOptions = signal<AuditFilterOptions | null>(null);
  readonly filters = signal<AuditFilters>({ ...INITIAL_FILTERS });
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly totalElements = signal(0);

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalElements() / this.filters().size)),
  );
  readonly page = computed(() => this.filters().page);
  readonly hasPreviousPage = computed(() => this.filters().page > 0);
  readonly hasNextPage = computed(() => this.filters().page + 1 < this.totalPages());

  open(request: AuditTrailRequest): void {
    this.events.set([]);
    this.totalElements.set(0);
    this.filters.set({
      ...(request.entityType ? { entityType: request.entityType } : {}),
      ...(request.entityId ? { entityId: request.entityId } : {}),
      ...(request.module ? { module: request.module } : {}),
      page: 0,
      size: this.filters().size,
    });
    this.loadFilterOptions();
    this.reload();
  }

  applyFilters(partial: Partial<AuditFilters>): void {
    this.filters.update((current) => ({ ...current, ...partial, page: 0 }));
    this.reload();
  }

  nextPage(): void {
    if (!this.hasNextPage()) return;
    this.goToPage(this.filters().page + 1);
  }

  previousPage(): void {
    if (!this.hasPreviousPage()) return;
    this.goToPage(this.filters().page - 1);
  }

  goToPage(page: number): void {
    const target = Math.min(Math.max(page, 0), this.totalPages() - 1);
    if (target === this.filters().page) return;
    this.filters.update((current) => ({ ...current, page: target }));
    this.reload();
  }

  reload(): void {
    this.load().subscribe({ error: () => undefined });
  }

  load(): Observable<PagedResponse<AuditEvent>> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.getAll(this.filters()).pipe(
      tap({
        next: (page) => {
          this.events.set(page.content);
          this.totalElements.set(page.totalElements);
        },
        error: (failure: unknown) => this.error.set(this.message(failure)),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  loadFilterOptions(): void {
    this.api
      .getFilterOptions(this.filters())
      .pipe(
        tap({
          next: (options) => this.filterOptions.set(options),
          error: () => this.filterOptions.set({ actions: [], actors: [], dateRange: null }),
        }),
      )
      .subscribe({ error: () => undefined });
  }

  clearFilters(): void {
    this.filters.update((current) => ({
      ...(current.entityType ? { entityType: current.entityType } : {}),
      ...(current.entityId ? { entityId: current.entityId } : {}),
      ...(current.module ? { module: current.module } : {}),
      page: 0,
      size: current.size,
    }));
    this.reload();
  }

  private message(failure: unknown): string {
    if (
      typeof failure === 'object' &&
      failure !== null &&
      'error' in failure &&
      typeof failure.error === 'object' &&
      failure.error !== null &&
      'message' in failure.error &&
      typeof failure.error.message === 'string'
    ) {
      return failure.error.message;
    }
    if (failure instanceof Error) return failure.message;
    if (
      typeof failure === 'object' &&
      failure !== null &&
      'message' in failure &&
      typeof failure.message === 'string'
    ) {
      return failure.message;
    }
    return 'audit.error';
  }
}
