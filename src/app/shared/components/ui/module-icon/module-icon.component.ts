import { moduleIconForUrl } from '@core/layouts/config/module-icons';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs';

@Component({
  selector: 'app-module-icon',
  standalone: true,
  templateUrl: './module-icon.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex shrink-0' },
})
export class ModuleIconComponent {
  private readonly router = inject(Router);

  readonly icon = input<string>();

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  readonly resolvedIcon = computed(() => this.icon() ?? moduleIconForUrl(this.currentUrl() || ''));
}
