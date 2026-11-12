import { TranslatePipe } from '@core/i18n/translate.pipe';
import { moduleIconForUrl } from '@core/layouts/config/module-icons';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './page-header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeaderComponent {
  private readonly router = inject(Router);

  title = input.required<string>();
  subtitle = input<string>();
  kicker = input<string>();
  icon = input<string>();
  hero = input(false);

  readonly displayIcon = computed(() => this.icon() ?? moduleIconForUrl(this.router.url || ''));
  readonly showIcon = computed(() => this.hero() && this.displayIcon() !== null);
}
