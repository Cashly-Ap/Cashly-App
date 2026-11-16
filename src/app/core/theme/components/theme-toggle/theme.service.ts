import { computed, DestroyRef, effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ThemeMode, UserPreferencesService } from '@core/preferences/user-preferences.service';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly preferences = inject(UserPreferencesService);
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly destroyRef = inject(DestroyRef);
  private readonly systemDark = signal(false);

  readonly themeMode = this.preferences.themeMode;
  readonly isDarkMode = computed(() =>
    this.themeMode() === 'system' ? this.systemDark() : this.themeMode() === 'dark',
  );

  constructor() {
    if (!this.isBrowser) return;
    const media = this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)');
    if (media) {
      this.systemDark.set(media.matches);
      const listener = (event: MediaQueryListEvent) => this.systemDark.set(event.matches);
      media.addEventListener('change', listener);
      this.destroyRef.onDestroy(() => media.removeEventListener('change', listener));
    }
    this.applyTheme();
    effect(() => this.applyTheme());
  }

  setMode(mode: ThemeMode): void {
    this.preferences.setThemeMode(mode);
  }

  toggleTheme(): void {
    this.setMode(this.isDarkMode() ? 'light' : 'dark');
  }

  private applyTheme(): void {
    this.document.documentElement.classList.toggle('my-app-dark', this.isDarkMode());
    this.document.documentElement.style.colorScheme = this.isDarkMode() ? 'dark' : 'light';
  }
}
