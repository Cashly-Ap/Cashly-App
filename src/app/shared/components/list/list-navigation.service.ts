import { DestroyRef, Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthorizationService } from '@features/platform/auth/authorization/services/authorization.service';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';
import { PermissionAction } from '@features/platform/auth/authorization/models/access.model';
import { moduleForUrl } from '@features/platform/auth/authorization/models/permission-context';
import { MessageService } from 'primeng/api';
import { ListAction } from './list-action-buttons/list-action-buttons.component';

export interface ListNavigationFilter {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  change: (value: string) => void;
}

export interface ListNavigationOptions<T> {
  filters?: () => readonly ListNavigationFilter[];
  records: () => readonly T[];
  loading: () => boolean;
  total: () => number;
  first: () => number;
  rows: () => number;
  search: (term: string) => void;
  paginate: (event: { first: number; rows: number }) => void;
  label: (record: T) => string;
  description?: (record: T) => string;
  actions: (record: T) => readonly ListAction[];
  extras?: (record: T) => readonly ListAction[];
  acceptsAction?: (label: string) => boolean;
  onActionChange?: (label: string | null) => void;
  globalActions?: () => readonly ListAction[];
  refresh?: () => void;
}

export interface NavigationRecord {
  id?: string;
  key?: string;
  label: string;
  description: string;
  action: () => ListAction | undefined;
}

export interface ListNavigationSession {
  filters?: () => readonly ListNavigationFilter[];
  owner: object;
  title: string;
  module: BusinessModule | null;
  route?: ActivatedRoute;
  onClose?: () => void;
  records: () => NavigationRecord[];
  loading: () => boolean;
  total: () => number;
  first: () => number;
  rows: () => number;
  search: (term: string) => void;
  paginate: (event: { first: number; rows: number }) => void;
}

export interface ListNavigationRegistration<T> {
  owner: object;
  module: BusinessModule | null;
  records: () => readonly T[];
  label?: (record: T) => string;
  actions: (record: T) => readonly ListAction[];
  extras?: (record: T) => readonly ListAction[];
  refresh?: () => void;
}

@Injectable({ providedIn: 'root' })
export class ListNavigationService {
  private readonly router = inject(Router);
  private readonly authorization = inject(AuthorizationService);
  private readonly messages = inject(MessageService, { optional: true });
  readonly session = signal<ListNavigationSession | null>(null);
  private readonly registrations = new Map<object, ListNavigationRegistration<unknown>>();

  register<T>(registration: ListNavigationRegistration<T>): void {
    this.registrations.set(
      registration.owner,
      registration as ListNavigationRegistration<unknown>,
    );
  }

  unregister(owner: object): void {
    this.registrations.delete(owner);
  }

  executeRecordAction(route: string, label: string, recordId: string): boolean {
    const module = moduleForUrl(route);
    const currentModule = moduleForUrl(this.router.url);
    if (!module || module !== currentModule) return false;

    for (const registration of this.registrations.values()) {
      if (registration.module !== currentModule) continue;
      const record = registration.records().find((item) => this.keyFor(item) === recordId);
      if (!record) continue;
      const action = [
        ...registration.actions(record),
        ...(registration.extras?.(record) ?? []),
      ].find((item) => item.label === label);
      if (!action || action.disabled || !this.allowed(action, currentModule)) return false;
      action.command();
      return true;
    }
    return false;
  }

  executeRegistered(route: string, label: string, recordId: string): boolean {
    return this.executeRecordAction(route, label, recordId);
  }

  private keyFor(record: unknown): string | undefined {
    if (typeof record !== 'object' || record === null) return undefined;
    if ('id' in record && typeof record.id === 'string') return record.id;
    if ('customerId' in record && typeof record.customerId === 'string') return record.customerId;
    return undefined;
  }

  allowed(action: ListAction | undefined, module: BusinessModule | null): boolean {
    return (
      !!action &&
      !!(action.module ?? module) &&
      !!action.requiredAction &&
      this.authorization.can((action.module ?? module) as BusinessModule, action.requiredAction) &&
      (action.requiredPermissions ?? []).every((grant) => {
        const [owner, permission] = grant.split(':');
        return this.authorization.can(owner as BusinessModule, permission as PermissionAction);
      })
    );
  }

  available(record: NavigationRecord): boolean {
    const session = this.session();
    const action = record.action();
    return (
      !!session && !session.loading() && !action?.disabled && this.allowed(action, session.module)
    );
  }

  async select(record: NavigationRecord): Promise<void> {
    const session = this.session();
    if (!session || !session.records().includes(record) || !this.available(record)) return;
    const action = record.action();
    if (!action) return;
    this.session.set(null);
    session.onClose?.();
    const navigated = session.route ? await this.clearRequest(session.route) : true;
    if (navigated !== false && this.allowed(action, session.module) && !action.disabled)
      action.command();
  }

  dismiss(): void {
    const session = this.session();
    this.session.set(null);
    session?.onClose?.();
    if (session?.route) void this.clearRequest(session.route);
  }

  detach(owner: object): void {
    if (this.session()?.owner === owner) this.session.set(null);
  }

  async executeGlobal(
    action: ListAction,
    route: ActivatedRoute,
    module: BusinessModule | null,
  ): Promise<void> {
    if (!this.allowed(action, module)) return;
    if (action.disabled) {
      this.messages?.add({
        severity: 'info',
        summary: action.label,
        detail: 'Esta acción no está disponible en el estado actual.',
      });
      await this.clearRequest(route);
      return;
    }
    this.session.set(null);
    const navigated = await this.clearRequest(route);
    if (navigated !== false && !action.disabled && this.allowed(action, module)) action.command();
  }

  private clearRequest(route: ActivatedRoute): Promise<boolean> {
    return this.router.navigate([], {
      relativeTo: route,
      queryParams: { navAction: null, navRecord: null, navSearch: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}

export function connectListNavigation<T>(options: ListNavigationOptions<T>): void {
  const route = inject(ActivatedRoute, { optional: true });
  if (!route?.queryParamMap) return;
  const destroyRef = inject(DestroyRef);
  const router = inject(Router);
  const navigation = inject(ListNavigationService);
  const owner = {};
  let requestedAction: string | null = null;
  let destroyed = false;
  const pendingGlobal = signal<string | null>(null);
  const pendingRecord = signal<{ id: string; action: string } | null>(null);
  const keyFor = (record: T): string | undefined => {
    if (typeof record !== 'object' || record === null) return undefined;
    if ('id' in record && typeof record.id === 'string') return record.id;
    if ('customerId' in record && typeof record.customerId === 'string') return record.customerId;
    return undefined;
  };
  effect(() => {
    const target = pendingRecord();
    if (!target || options.loading()) return;
    const records = options.records();
    const record = records.find((item) => keyFor(item) === target.id);
    const first = options.first();
    const rows = options.rows();
    const total = options.total();
    untracked(() => {
      if (record) {
        pendingRecord.set(null);
        const selectedAction = options.actions(record).find((item) => item.label === target.action);
        if (selectedAction)
          void navigation.executeGlobal(selectedAction, route, moduleForUrl(router.url));
      } else if (first + rows < total) {
        options.paginate({ first: first + rows, rows });
      } else {
        pendingRecord.set(null);
        void router.navigate([], {
          relativeTo: route,
          queryParams: { navAction: null, navRecord: null, navSearch: null },
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });
      }
    });
  });
  effect(() => {
    const action = pendingGlobal();
    const loading = options.loading();
    if (!action || loading) return;
    untracked(() => {
      pendingGlobal.set(null);
      const globalAction = options.globalActions?.().find((item) => item.label === action);
      if (globalAction)
        void navigation.executeGlobal(globalAction, route, moduleForUrl(router.url));
    });
  });
  destroyRef.onDestroy(() => {
    destroyed = true;
    navigation.detach(owner);
    navigation.unregister(owner);
  });
  navigation.register({
    owner,
    module: moduleForUrl(router.url),
    records: options.records,
    label: options.label,
    actions: options.actions,
    extras: options.extras,
    refresh: options.refresh,
  });
  route.queryParamMap.pipe(takeUntilDestroyed(destroyRef)).subscribe((params) => {
    const action = params.get('navAction');
    if (!action) {
      const hadAction = requestedAction !== null;
      requestedAction = null;
      pendingGlobal.set(null);
      pendingRecord.set(null);
      navigation.detach(owner);
      if (hadAction) options.onActionChange?.(null);
      return;
    }
    if (requestedAction === action) return;
    if (options.acceptsAction && !options.acceptsAction(action)) return;
    requestedAction = action;
    options.onActionChange?.(action);
    queueMicrotask(() => {
      if (destroyed || requestedAction !== action) return;
      const module = moduleForUrl(router.url);
      if (options.globalActions) {
        pendingGlobal.set(action);
        return;
      }
      const targetId = params.get('navRecord');
      if (targetId) {
        options.search(params.get('navSearch') ?? '');
        pendingRecord.set({ id: targetId, action });
        return;
      }
      const records = computed(() =>
        options
          .records()
           .map((record) => ({
             id: keyFor(record),
             label: options.label(record),
            description: options.description?.(record) ?? '',
            action: () =>
              [...options.actions(record), ...(options.extras?.(record) ?? [])].find(
                (item) => item.label === action,
              ),
          }))
          .filter((record) => {
            const selectedAction = record.action();
            return !selectedAction?.disabled && navigation.allowed(selectedAction, module);
          }),
      );
      navigation.session.set({
        owner,
        title: action,
        module,
        route,
        records,
        filters: options.filters,
        loading: options.loading,
        total: options.total,
        first: options.first,
        rows: options.rows,
        search: options.search,
        paginate: options.paginate,
      });
      options.search('');
    });
  });
}
