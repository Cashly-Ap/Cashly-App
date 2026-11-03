import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { GLOBAL_DIALOG_HOSTS } from '@shared/services/global-dialog-hosts.token';

@Component({
  selector: 'app-global-dialog-host',
  standalone: true,
  imports: [NgComponentOutlet],
  templateUrl: './global-dialog-host.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GlobalDialogHostComponent {
  readonly hosts = inject(GLOBAL_DIALOG_HOSTS);
}
