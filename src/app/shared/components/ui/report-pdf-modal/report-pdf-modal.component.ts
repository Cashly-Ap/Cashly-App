import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { TranslatePipe } from '@core/i18n/translate.pipe';

@Component({
  selector: 'app-report-pdf-modal',
  standalone: true,
  imports: [DialogModule, TranslatePipe],
  templateUrl: './report-pdf-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportPdfModalComponent {
  readonly visible = input(false);
  readonly titleKey = input.required<string>();
  readonly width = input('500px');

  readonly visibleChange = output<boolean>();
  readonly show = output<void>();
}
