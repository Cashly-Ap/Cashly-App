import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { PagedResponse } from '@shared/models/interfaces/paged-response.interface';
import {
  AuditAction,
  AuditActor,
  AuditChange,
  AuditEvent,
  AuditFilterOptions,
  AuditFilterScope,
  AuditFilters,
} from '@features/platform/audit/models';

interface AuditActorApiResponse {
  id?: string | null;
  name?: string | null;
  photoUrl?: string | null;
}

interface AuditEventApiResponse {
  id: string;
  module: string;
  entityType: AuditEvent['entityType'];
  entityId: string;
  entityLabel: string;
  secondaryLabel?: string | null;
  action: AuditAction;
  actor?: AuditActorApiResponse | null;
  occurredAt: string;
  descriptionKey: string;
  descriptionArgs?: string[] | null;
  changes?: AuditChange[] | null;
  metadata?: Record<string, unknown> | null;
}

interface AuditActionOptionApiResponse {
  value: AuditAction;
  labelKey?: string | null;
  count?: number | null;
}

interface AuditActorOptionApiResponse extends AuditActorApiResponse {
  count?: number | null;
}

interface AuditDateRangeApiResponse {
  min?: string | null;
  max?: string | null;
}

interface AuditFilterOptionsApiResponse {
  actions?: Array<AuditActionOptionApiResponse | AuditAction> | null;
  actors?: AuditActorOptionApiResponse[] | null;
  dateRange?: AuditDateRangeApiResponse | null;
}

@Injectable({ providedIn: 'root' })
export class AuditApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/audit-events';

  getAll(filters: AuditFilters): Observable<PagedResponse<AuditEvent>> {
    return this.http
      .get<PagedResponse<AuditEventApiResponse>>(this.baseUrl, {
        params: this.buildParams(filters),
      })
      .pipe(
        map((page) => ({
          ...page,
          content: page.content.map((event) => this.toEvent(event)),
        })),
      );
  }

  getFilterOptions(scope: AuditFilterScope): Observable<AuditFilterOptions> {
    let params = new HttpParams();
    if (scope.entityType) params = params.set('entityType', scope.entityType);
    if (scope.entityId) params = params.set('entityId', scope.entityId);
    if (scope.module) params = params.set('module', scope.module);

    return this.http
      .get<AuditFilterOptionsApiResponse>(`${this.baseUrl}/filter-options`, { params })
      .pipe(
        map((options) => ({
          actions: (options.actions ?? []).map((action) => this.toActionOption(action)),
          actors: (options.actors ?? []).map((actor) => ({
            ...this.toActor(actor),
            count: actor.count ?? 0,
          })),
          dateRange: options.dateRange
            ? { min: options.dateRange.min ?? null, max: options.dateRange.max ?? null }
            : null,
        })),
      );
  }

  getById(id: string): Observable<AuditEvent> {
    return this.http
      .get<AuditEventApiResponse>(`${this.baseUrl}/${id}`)
      .pipe(map((event) => this.toEvent(event)));
  }

  private buildParams(filters: AuditFilters): HttpParams {
    let params = new HttpParams()
      .set('page', String(filters.page))
      .set('size', String(filters.size));

    if (filters.entityType) params = params.set('entityType', filters.entityType);
    if (filters.entityId) params = params.set('entityId', filters.entityId);
    if (filters.module) params = params.set('module', filters.module);
    if (filters.actorId) params = params.set('actorId', filters.actorId);
    if (filters.from) params = params.set('from', filters.from);
    if (filters.to) params = params.set('to', filters.to);
    for (const action of filters.action ?? []) {
      params = params.append('action', action);
    }

    return params;
  }

  private toEvent(event: AuditEventApiResponse): AuditEvent {
    return {
      id: event.id,
      module: event.module,
      entityType: event.entityType,
      entityId: event.entityId,
      entityLabel: event.entityLabel,
      secondaryLabel: event.secondaryLabel ?? null,
      action: event.action,
      actor: this.toActor(event.actor),
      occurredAt: event.occurredAt,
      descriptionKey: event.descriptionKey,
      descriptionArgs: event.descriptionArgs ?? [],
      changes: event.changes ?? [],
      metadata: event.metadata ?? null,
    };
  }

  private toActor(actor?: AuditActorApiResponse | null): AuditActor {
    return {
      id: actor?.id ?? null,
      name: actor?.name ?? '',
      photoUrl: actor?.photoUrl ?? null,
    };
  }

  private toActionOption(
    action: AuditActionOptionApiResponse | AuditAction,
  ): AuditFilterOptions['actions'][number] {
    if (typeof action === 'string') {
      return { value: action, labelKey: `audit.actions.${action}`, count: 0 };
    }
    return {
      value: action.value,
      labelKey: action.labelKey ?? `audit.actions.${action.value}`,
      count: action.count ?? 0,
    };
  }
}
