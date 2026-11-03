import { LocalizedDatePipe, LocalizedCurrencyPipe } from '@core/i18n/localized-format.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { PermissionDirective } from '@features/platform/auth/authorization/directives/permission.directive';
import {
  Component,
  inject,
  OnInit,
  signal,
  computed,
  ChangeDetectionStrategy,
  DestroyRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ListContainerComponent } from '@shared/components/list/list-container/list-container.component';
import { LoadingSpinnerComponent } from '@shared/components/ui/loading-spinner/loading-spinner.component';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { Popover } from 'primeng/popover';
import { CashRegisterApplicationService } from '@features/finance/treasury/cash-register/services/application/cash-register-application.service';
import { CashRegisterOpenDialogComponent } from '@features/finance/treasury/cash-register/components/cash-register-open-dialog/cash-register-open-dialog.component';
import { CashRegisterCloseDialogComponent } from '@features/finance/treasury/cash-register/components/cash-register-close-dialog/cash-register-close-dialog.component';
import { CashRegisterDetailDialogComponent } from '@features/finance/treasury/cash-register/components/cash-register-detail-dialog/cash-register-detail-dialog.component';

import { PanelCardComponent } from '@shared/components/ui/panel-card/panel-card.component';
@Component({
  selector: 'app-cash-register-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PanelCardComponent,
    TranslatePipe,
    LocalizedDatePipe,
    LocalizedCurrencyPipe,
    PermissionDirective,
    ListContainerComponent,
    LoadingSpinnerComponent,
    ButtonModule,
    TagModule,
    Popover,
    CashRegisterOpenDialogComponent,
    CashRegisterCloseDialogComponent,
    CashRegisterDetailDialogComponent,
  ],
  templateUrl: './cash-register-page.component.html',
})
export class CashRegisterPageComponent implements OnInit {
  private readonly service = inject(CashRegisterApplicationService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly activeClosure = this.service.activeClosure;
  readonly loading = this.service.loading;

  readonly showInitialLoading = computed(
    () => this.service.loading() && this.service.activeClosure() === null,
  );

  readonly showEmptyState = computed(
    () => !this.service.loading() && this.service.activeClosure() === null,
  );

  readonly closure = computed(() => this.service.activeClosure());
  readonly details = computed(() => this.closure()?.details ?? []);
  readonly isOpen = computed(() => this.closure()?.status === 'OPEN');
  readonly isClosed = computed(() => this.closure()?.status === 'CLOSED');

  readonly canClose = computed(() => this.isOpen());

  readonly openDialogVisible = signal(false);
  readonly closeDialogVisible = signal(false);
  readonly detailDialogVisible = signal(false);

  ngOnInit(): void {
    this.service.loadActiveClosure().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  onOpenDialogOpen(): void {
    this.openDialogVisible.set(true);
  }

  onOpenCloseDialog(): void {
    this.closeDialogVisible.set(true);
  }

  onOpenDetailDialog(): void {
    this.detailDialogVisible.set(true);
  }

  onViewHistory(): void {
    this.router.navigate(['/finance/treasury/cash-register/history']);
  }

  getStatusLabel(status: string | undefined): string {
    switch (status) {
      case 'OPEN':
        return 'Abierto';
      case 'CLOSED':
        return 'Cerrado';
      case 'VERIFIED':
        return 'Verificado';
      default:
        return status ?? '';
    }
  }

  getStatusSeverity(status: string | undefined): 'info' | 'warn' | 'success' | 'contrast' {
    switch (status) {
      case 'OPEN':
        return 'info';
      case 'CLOSED':
        return 'warn';
      case 'VERIFIED':
        return 'success';
      default:
        return 'contrast';
    }
  }
}
