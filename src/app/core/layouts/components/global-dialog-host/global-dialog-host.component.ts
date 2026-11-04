import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import {
  GLOBAL_DIALOG_HOSTS,
  LoadedGlobalDialogHost,
} from '@shared/services/global-dialog-hosts.token';

@Component({
  selector: 'app-global-dialog-host',
  standalone: true,
  imports: [NgComponentOutlet],
  templateUrl: './global-dialog-host.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GlobalDialogHostComponent {
  private readonly registrations = inject(GLOBAL_DIALOG_HOSTS);
  readonly hosts = signal<LoadedGlobalDialogHost[]>([]);

  constructor() {
    void Promise.all(
      this.registrations.map(async (registration) => ({
        key: registration.key,
        component: await registration.load(),
      })),
    )
      .then((hosts) => this.hosts.set(hosts))
      .catch(() => this.hosts.set([]));
  }
}
