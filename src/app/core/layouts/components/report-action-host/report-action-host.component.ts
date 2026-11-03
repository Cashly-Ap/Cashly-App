import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { ReportActionService } from '@shared/services/report-action.service';

@Component({
  selector: 'app-report-action-host',
  standalone: true,
  imports: [NgComponentOutlet],
  templateUrl: './report-action-host.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportActionHostComponent {
  readonly reports = inject(ReportActionService);
}
