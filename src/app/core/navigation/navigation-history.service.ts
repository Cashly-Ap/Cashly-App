import { DestroyRef, Injectable, inject } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

const HISTORY_LIMIT = 100;
const DEFAULT_DESTINATION = '/analytics/dashboard';
const DIRECT_RECORD_ACTIONS = new Set([
  'Editar',
  'Ver detalle',
  'Ver stock',
  'Historial de movimientos',
  'Ver saldo',
]);

@Injectable({ providedIn: 'root' })
export class NavigationHistoryService {
  private readonly router = inject(Router);
  private readonly history: string[] = [];
  private transientPath: string | null = null;
  private returningTo: string | null = null;
  private restoredNavigation = false;

  constructor() {
    this.remember(this.router.url);
    this.router.events?.pipe(takeUntilDestroyed(inject(DestroyRef))).subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.restoredNavigation = event.navigationTrigger === 'popstate';
      } else if (event instanceof NavigationEnd) {
        this.remember(event.urlAfterRedirects);
      }
    });
  }

  back(fallback: string | readonly unknown[] = DEFAULT_DESTINATION): void {
    const current = this.router.url;
    const latest = this.history.at(-1);
    const destination = latest && latest !== current ? latest : this.history.at(-2);
    if (!destination) {
      if (Array.isArray(fallback)) void this.router.navigate([...fallback]);
      else void this.router.navigate([fallback]);
      return;
    }
    this.returningTo = destination;
    void Promise.resolve(this.router.navigateByUrl(destination, { replaceUrl: true })).then(
      (success) => {
        if (!success) this.returningTo = null;
      },
      () => {
        this.returningTo = null;
      },
    );
  }

  private remember(url: string | undefined): void {
    if (
      !url ||
      url === '/' ||
      /^\/platform\/auth\/(login|register|forgot-password|reset-password)(?:[/?#]|$)/.test(url)
    )
      return;
    const path = url.split(/[?#]/)[0];
    if (/[?&]navAction=/.test(url)) {
      const action = new URLSearchParams(url.split('?')[1]?.split('#')[0]).get('navAction');
      this.transientPath = action && DIRECT_RECORD_ACTIONS.has(action) ? path : null;
      return;
    }
    if (this.transientPath === path) return;
    this.transientPath = null;
    const existingIndex = this.history.lastIndexOf(url);
    if ((this.returningTo === url || this.restoredNavigation) && existingIndex >= 0) {
      this.history.splice(existingIndex + 1);
    } else if (this.history.at(-1) !== url) {
      const replace = this.router.getCurrentNavigation?.()?.extras.replaceUrl;
      if (replace && this.history.length) this.history[this.history.length - 1] = url;
      else this.history.push(url);
      if (this.history.length > HISTORY_LIMIT) this.history.shift();
    }
    this.returningTo = null;
    this.restoredNavigation = false;
  }
}
