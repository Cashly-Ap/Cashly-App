import { TranslatePipe } from '@core/i18n/translate.pipe';
import { ModuleIconComponent } from '@shared/components/ui/module-icon/module-icon.component';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [TranslatePipe, ModuleIconComponent],
  templateUrl: './page-header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class PageHeaderComponent {
  title = input.required<string>();
  subtitle = input<string>();
  kicker = input('finance.billing.creditnotes.cashlyManagement');
  icon = input<string>();
  hero = input(true);
}
