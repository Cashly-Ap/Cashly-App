import { TranslationService } from '@core/i18n/translation.service';
import { Language } from '@core/i18n/language';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  DestroyRef,
  Injectable,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { environment } from '@env/environment';
import { AuthService } from '@features/platform/auth/services/application/auth-application.service';

export type ThemeMode = 'system' | 'light' | 'dark';
export type ColorMode = 'minimal' | 'informative';
export interface UserPreferences {
  language: Language;
  themeMode: ThemeMode;
  colorMode: ColorMode;
  shortcutsEnabled: boolean;
  showShortcutHints: boolean;
}
export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  language: 'es',
  themeMode: 'system',
  colorMode: 'minimal',
  shortcutsEnabled: false,
  showShortcutHints: true,
};

function validPreferences(value: unknown): value is UserPreferences {
  if (typeof value !== 'object' || value === null) return false;
  const preferences = value as Partial<UserPreferences>;
  return (
    ['es', 'en'].includes(preferences.language ?? '') &&
    ['system', 'light', 'dark'].includes(preferences.themeMode ?? '') &&
    ['minimal', 'informative'].includes(preferences.colorMode ?? '') &&
    typeof preferences.shortcutsEnabled === 'boolean' &&
    typeof preferences.showShortcutHints === 'boolean'
  );
}

@Injectable({ providedIn: 'root' })
export class UserPreferencesService {
  private readonly translations = inject(TranslationService);
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly document = inject(DOCUMENT);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly identity = computed(() => this.auth.currentUser()?.id ?? null);
  private readonly endpoint = `${environment.apiUrl}/auth/preferences`;
  private readonly state = signal<UserPreferences>(this.guestDefaults());
  readonly language = computed(() => this.state().language);
  readonly themeMode = computed(() => this.state().themeMode);
  readonly colorMode = computed(() => this.state().colorMode);
  readonly shortcutsEnabled = computed(() => this.state().shortcutsEnabled);
  readonly showShortcutHints = computed(() => this.state().showShortcutHints);
  readonly loading = signal(false);
  readonly ready = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  private userId: string | null = null;
  private epoch = 0;
  private confirmed = { ...DEFAULT_USER_PREFERENCES };
  private queue: UserPreferences[] = [];
  private failed: UserPreferences | null = null;
  private requests = new Subscription();
  private loadFailed = false;

  constructor() {
    effect(() => {
      const userId = this.identity();
      untracked(() => this.bindUser(userId));
    });
    effect(() => {
      if (this.browser)
        this.document.documentElement.classList.toggle(
          'cashly-informative',
          this.colorMode() === 'informative',
        );
    });
    inject(DestroyRef).onDestroy(() => this.requests.unsubscribe());
  }

  setLanguage(language: Language): void {
    this.update({ language });
  }

  syncLanguage(language: Language): void {
    if (!['es', 'en'].includes(language) || this.identity() !== this.userId) return;
    this.confirmed = { ...this.confirmed, language };
    this.state.update((preferences) => ({ ...preferences, language }));
    this.queue = this.queue.map((preferences) => ({ ...preferences, language }));
    if (this.failed) this.failed = { ...this.failed, language };
    this.writeCache(this.confirmed);
  }

  setThemeMode(themeMode: ThemeMode): void {
    this.update({ themeMode });
  }
  setColorMode(colorMode: ColorMode): void {
    this.update({ colorMode });
  }
  setShortcutsEnabled(shortcutsEnabled: boolean): void {
    this.update({ shortcutsEnabled });
  }

  setShowShortcutHints(showShortcutHints: boolean): void {
    this.update({ showShortcutHints });
  }

  retry(): void {
    if (this.saving() || this.loading()) return;
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
    this.ready.set(!userId);
    this.loading.set(false);
    this.error.set(null);
    const initial = userId
      ? (this.readCache(userId) ?? { ...DEFAULT_USER_PREFERENCES })
      : this.guestDefaults();
    this.confirmed = initial;
    this.state.set(initial);
    if (userId && this.browser) this.load();
  }

  private load(): void {
    const epoch = this.epoch;
    this.loading.set(true);
    this.error.set(null);
    this.requests.add(
      this.http.get<unknown>(this.endpoint).subscribe({
        next: (value) => {
          if (epoch !== this.epoch || this.identity() !== this.userId) return;
          if (!validPreferences(value)) {
            this.loadError();
            return;
          }
          this.confirmed = value;
          this.state.set(value);
          this.writeCache(value);
          this.loading.set(false);
          this.loadFailed = false;
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
    this.error.set(
      this.translations.t('auth.profile.could.not.load.your.settings.retry.before.changing.them'),
    );
  }

  private update(patch: Partial<UserPreferences>): void {
    if (this.identity() !== this.userId || this.loading() || this.loadFailed) return;
    const next = { ...this.state(), ...patch };
    if (!validPreferences(next)) return;
    this.state.set(next);
    if (!this.userId) {
      if (this.browser) {
        try {
          localStorage.setItem('cashly:guest-theme', next.themeMode);
        } catch {}
      }
      return;
    }
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
      this.http.put<unknown>(this.endpoint, next).subscribe({
        next: (value) => {
          if (epoch !== this.epoch || this.identity() !== this.userId) return;
          if (!validPreferences(value)) {
            this.saveError(next);
            return;
          }
          this.confirmed = value;
          this.writeCache(value);
          if (!this.queue.length) this.state.set(value);
          this.flush();
        },
        error: () => {
          if (epoch === this.epoch && this.identity() === this.userId) this.saveError(next);
        },
      }),
    );
  }

  private saveError(attempt: UserPreferences): void {
    this.failed = this.queue.at(-1) ?? attempt;
    this.queue = [];
    this.state.set(this.confirmed);
    this.saving.set(false);
    this.error.set(
      this.translations.t(
        'auth.profile.could.not.save.your.settings.the.last.saved.settings.have.been.restored',
      ),
    );
  }

  private guestDefaults(): UserPreferences {
    let themeMode: ThemeMode = 'system';
    if (this.browser) {
      try {
        const legacy = localStorage.getItem('cashly:guest-theme') ?? localStorage.getItem('theme');
        if (legacy === 'light' || legacy === 'dark' || legacy === 'system') themeMode = legacy;
      } catch {}
    }
    return { ...DEFAULT_USER_PREFERENCES, themeMode };
  }

  private readCache(userId: string): UserPreferences | null {
    if (!this.browser) return null;
    try {
      const value: unknown = JSON.parse(
        localStorage.getItem(`cashly:preferences:v2:${userId}`) ?? 'null',
      );
      return validPreferences(value) ? value : null;
    } catch {
      return null;
    }
  }

  private writeCache(value: UserPreferences): void {
    if (!this.browser || !this.userId) return;
    try {
      localStorage.setItem(`cashly:preferences:v2:${this.userId}`, JSON.stringify(value));
    } catch {}
  }
}
