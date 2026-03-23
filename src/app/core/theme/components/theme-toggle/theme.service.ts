import { Injectable, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  isDarkMode = signal<boolean>(this.getInitialTheme());

  constructor() {
    if (this.isBrowser) {
      this.applyTheme(this.isDarkMode());

      effect(() => {
        this.applyTheme(this.isDarkMode());
      });
    }
  }

  toggleTheme(): void {
    this.isDarkMode.update((value) => !value);
  }

  private getInitialTheme(): boolean {
    if (!this.isBrowser) {
      return false;
    }

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private applyTheme(isDark: boolean): void {
    if (!this.isBrowser) return;

    const htmlElement = document.documentElement;

    if (isDark) {
      htmlElement.classList.add('my-app-dark');
      localStorage.setItem('theme', 'dark');
    } else {
      htmlElement.classList.remove('my-app-dark');
      localStorage.setItem('theme', 'light');
    }
  }
}
