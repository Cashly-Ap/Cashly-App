import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { ActionDialogService } from '@shared/services/action-dialog.service';

@Component({
  selector: 'app-action-dialog-host',
  standalone: true,
  imports: [NgComponentOutlet],
  templateUrl: './action-dialog-host.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionDialogHostComponent {
  readonly dialogs = inject(ActionDialogService);

  inputs(recordId: string): Record<string, unknown> {
    return { recordId };
  }
}
