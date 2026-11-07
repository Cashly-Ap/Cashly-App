import { DestroyRef, Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '@features/platform/auth/services/application/auth-application.service';
import { NotificationPreferencesApiService } from '@features/platform/notifications/services/api/notification-preferences-api.service';
import {
  NotificationPreferences,
  NotificationPreferencesUpdate,
} from '@features/platform/notifications/models/notification-preferences.model';

const EMPTY_PREFERENCES: NotificationPreferences = { enabled: true, modules: [] };

function validPreferences(value: unknown): value is NotificationPreferences {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as { enabled?: unknown; modules?: unknown };
  if (typeof candidate.enabled !== 'boolean' || !Array.isArray(candidate.modules)) return false;
  return candidate.modules.every((entry: unknown) => {
    if (typeof entry !== 'object' || entry === null) return false;
    const module = entry as { module?: unknown; labelKey?: unknown; enabled?: unknown };
    return (
      typeof module.module === 'string' &&
      typeof module.labelKey === 'string' &&
      typeof module.enabled === 'boolean'
    );
  });
}

@Injectable({ providedIn: 'root' })
export class NotificationPreferencesService {
  private readonly api = inject(NotificationPreferencesApiService);
  private readonly auth = inject(AuthService);
  private readonly identity = computed(() => this.auth.currentUser()?.id ?? null);

  private readonly state = signal<NotificationPreferences>({ ...EMPTY_PREFERENCES });

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly ready = signal(false);

  readonly enabled = computed(() => this.state().enabled);
  readonly modules = computed(() => this.state().modules);
  readonly hasEnabledModules = computed(() => this.modules().some((module) => module.enabled));
  readonly bellVisible = computed(() => this.enabled() && this.hasEnabledModules());

  private userId: string | null = null;
  private epoch = 0;
  private confirmed: NotificationPreferences = { ...EMPTY_PREFERENCES };
  private queue: NotificationPreferences[] = [];
  private failed: NotificationPreferences | null = null;
  private loadFailed = false;
  private requests = new Subscription();

  constructor() {
    effect(() => {
      const userId = this.identity();
      untracked(() => this.bindUser(userId));
    });
    inject(DestroyRef).onDestroy(() => this.requests.unsubscribe());
  }

  setEnabled(enabled: boolean): void {
    this.update({ enabled });
  }

  setModuleEnabled(module: string, enabled: boolean): void {
    this.update({
      modules: this.state().modules.map((item) =>
        item.module === module ? { ...item, enabled } : item,
      ),
    });
  }

  retry(): void {
    if (this.loading() || this.saving()) return;
    if (this.loadFailed) {
      this.load();
      return;
    }
    if (this.failed) this.update(this.failed);
  }

  private bindUser(userId: string | null): void {
    this.epoch++;
    this.requests.unsubscribe();
    this.requests = new Subscription();
    this.userId = userId;
    this.queue = [];
    this.failed = null;
    this.loadFailed = false;
    this.saving.set(false);
    this.loading.set(false);
    this.error.set(null);
    this.ready.set(!userId);
    this.confirmed = { ...EMPTY_PREFERENCES, modules: [] };
    this.state.set({ ...EMPTY_PREFERENCES, modules: [] });
    if (userId) this.load();
  }

  private load(): void {
    const epoch = this.epoch;
    this.loading.set(true);
    this.error.set(null);
    this.loadFailed = false;
    this.requests.add(
      this.api.get().subscribe({
        next: (value) => {
          if (epoch !== this.epoch || this.identity() !== this.userId) return;
          if (!validPreferences(value)) {
            this.loadError();
            return;
          }
          this.confirmed = value;
          this.state.set(value);
          this.loading.set(false);
          this.ready.set(true);
        },
        error: () => {
          if (epoch === this.epoch && this.identity() === this.userId) this.loadError();
        },
      }),
    );
  }

  private loadError(): void {
    this.loading.set(false);
    this.loadFailed = true;
    this.ready.set(false);
    this.error.set('platform.notifications.preferences.loadError');
  }

  private update(patch: Partial<NotificationPreferences>): void {
    if (!this.userId || this.identity() !== this.userId || this.loading() || this.loadFailed)
      return;
    const next = { ...this.state(), ...patch };
    if (!validPreferences(next)) return;
    this.state.set(next);
    this.error.set(null);
    this.failed = null;
    this.queue.push(next);
    if (!this.saving()) this.flush();
  }

  private flush(): void {
    if (this.identity() !== this.userId) return;
    const next = this.queue.shift();
    if (!next) {
      this.saving.set(false);
      return;
    }
    this.saving.set(true);
    const epoch = this.epoch;
    this.requests.add(
      this.api.update(this.toUpdate(next)).subscribe({
        next: (value) => {
          if (epoch !== this.epoch || this.identity() !== this.userId) return;
          if (!validPreferences(value)) {
            this.saveError(next);
            return;
          }
          this.confirmed = value;
          if (!this.queue.length) this.state.set(value);
          this.flush();
        },
        error: () => {
          if (epoch === this.epoch && this.identity() === this.userId) this.saveError(next);
        },
      }),
    );
  }

  private saveError(attempt: NotificationPreferences): void {
    this.failed = this.queue.at(-1) ?? attempt;
    this.queue = [];
    this.state.set(this.confirmed);
    this.saving.set(false);
    this.error.set('platform.notifications.preferences.saveError');
  }

  private toUpdate(preferences: NotificationPreferences): NotificationPreferencesUpdate {
    return {
      enabled: preferences.enabled,
      modules: preferences.modules.map(({ module, enabled }) => ({ module, enabled })),
    };
  }
}
