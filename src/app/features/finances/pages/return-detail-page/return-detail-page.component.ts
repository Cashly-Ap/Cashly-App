import { ChangeDetectionStrategy, Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MainLayoutComponent } from '@core/layouts/main-layout.component';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ContentCardComponent } from '@shared/components/ui/content-card/content-card.component';
import { LoadingSpinnerComponent } from '@shared/components/ui/loading-spinner/loading-spinner.component';
import { TextBadgeComponent } from '@shared/components/ui/text-badge/text-badge.component';
import { FinanceApplicationService } from '@features/finances/services/application/finance-application.service';
import { ReturnDetail } from '@features/finances/models/interfaces';
import { ReturnType, getReturnTypeLabel } from '@features/finances/models/enums/return-type.enum';
import { ReturnStatus } from '@features/finances/models/enums/return-status.enum';

@Component({
  selector: 'app-return-detail-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MainLayoutComponent,
    ButtonModule,
    TableModule,
    ConfirmDialogModule,
    ContentCardComponent,
    LoadingSpinnerComponent,
    TextBadgeComponent,
  ],
  templateUrl: './return-detail-page.component.html',
  providers: [ConfirmationService],
})
export class ReturnDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly financeService = inject(FinanceApplicationService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly returnData = signal<ReturnDetail | null>(null);
  readonly loading = this.financeService.loading;

  readonly showLoading = computed(() => this.loading() && !this.returnData());

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.financeService.loadReturnById(id).subscribe({
        next: (ret) => this.returnData.set(ret),
      });
    }
  }

  onCancel(): void {
    const ret = this.returnData();
    if (!ret) return;

    this.confirmationService.confirm({
      message: `¿Está seguro de que desea cancelar la devolución #${ret.returnNumber}?`,
      header: 'Confirmar Cancelación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, cancelar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.financeService.cancelReturn(ret.id).subscribe({
          next: (updated) => {
            this.returnData.set(updated);
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Devolución cancelada exitosamente',
              life: 3000,
            });
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al cancelar la devolución',
              life: 5000,
            });
          },
        });
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/finances/devoluciones']);
  }

  getReturnTypeLabel(type: string): string {
    return getReturnTypeLabel(type as ReturnType);
  }

  getReturnTypeVariant(type: string): 'info' | 'label' {
    return type === ReturnType.AUTOMATIC ? 'info' : 'label';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: 'Pendiente',
      COMPLETED: 'Completada',
      CANCELLED: 'Cancelada',
    };
    return labels[status] ?? status;
  }

  getStatusVariant(status: string): 'success' | 'danger' | 'info' | 'label' {
    const variants: Record<string, 'success' | 'danger' | 'info' | 'label'> = {
      PENDING: 'info',
      COMPLETED: 'success',
      CANCELLED: 'danger',
    };
    return variants[status] ?? 'label';
  }

  canCancel(status: string): boolean {
    return status !== ReturnStatus.CANCELLED && status !== ReturnStatus.COMPLETED;
  }
}
