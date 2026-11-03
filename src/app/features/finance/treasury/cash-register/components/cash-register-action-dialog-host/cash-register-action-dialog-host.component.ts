import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MessageService } from 'primeng/api';
import {
  CashRegisterActionDialogService,
  CashRegisterActionKind,
} from '@core/layouts/services/cash-register-action-dialog.service';
import { CashRegisterApplicationService } from '@features/finance/treasury/cash-register/services/application/cash-register-application.service';
import { CashRegisterOpenDialogComponent } from '@features/finance/treasury/cash-register/components/cash-register-open-dialog/cash-register-open-dialog.component';
import { CashRegisterCloseDialogComponent } from '@features/finance/treasury/cash-register/components/cash-register-close-dialog/cash-register-close-dialog.component';
import { CashRegisterDetailDialogComponent } from '@features/finance/treasury/cash-register/components/cash-register-detail-dialog/cash-register-detail-dialog.component';

const ACTION_LABELS: Record<CashRegisterActionKind, string> = {
  open: 'Abrir caja',
  close: 'Cerrar caja',
  detail: 'Ver detalles',
};

@Component({
  selector: 'app-cash-register-action-dialog-host',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CashRegisterOpenDialogComponent,
    CashRegisterCloseDialogComponent,
    CashRegisterDetailDialogComponent,
  ],
  templateUrl: './cash-register-action-dialog-host.component.html',
})
export class CashRegisterActionDialogHostComponent {
  private readonly actions = inject(CashRegisterActionDialogService);
  private readonly service = inject(CashRegisterApplicationService);
  private readonly messages = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  readonly openVisible = signal(false);
  readonly closeVisible = signal(false);
  readonly detailVisible = signal(false);

  private requestVersion = 0;

  constructor() {
    effect(() => {
      const request = this.actions.request();
      if (!request) return;
      const version = ++this.requestVersion;

      this.service
        .loadActiveClosure()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          if (version !== this.requestVersion) return;
          const closure = this.service.activeClosure();
          const eligible =
            request.action === 'open'
              ? !closure
              : request.action === 'close'
                ? closure?.status === 'OPEN'
                : !!closure;

          if (!eligible) {
            this.messages.add({
              severity: 'info',
              summary: ACTION_LABELS[request.action],
              detail: 'Esta acción no está disponible en el estado actual.',
            });
            this.actions.close();
            return;
          }

          switch (request.action) {
            case 'open':
              this.openVisible.set(true);
              return;
            case 'close':
              this.closeVisible.set(true);
              return;
            case 'detail':
              this.detailVisible.set(true);
              return;
          }
        });
    });
  }

  onOpenClosed(isVisible: boolean): void {
    this.openVisible.set(isVisible);
    if (isVisible) return;
    this.actions.close();
  }

  onCloseClosed(isVisible: boolean): void {
    this.closeVisible.set(isVisible);
    if (isVisible) return;
    this.actions.close();
  }

  onDetailClosed(isVisible: boolean): void {
    this.detailVisible.set(isVisible);
    if (isVisible) return;
    this.actions.close();
  }
}
