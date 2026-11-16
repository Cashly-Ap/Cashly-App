import { LocalizedDatePipe, LocalizedNumberPipe } from '@core/i18n/localized-format.pipe';
import { StatusVariant } from '@shared/models/status-variant';
import { purchaseStatusVariant } from '@features/procurement/purchases/models/purchase-status.presentation';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { NavigationHistoryService } from '@core/navigation/navigation-history.service';
import { PermissionDirective } from '@features/platform/auth/authorization/directives/permission.directive';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { DetailActionsMenuComponent } from '@shared/components/details/detail-actions-menu/detail-actions-menu.component';

import { DetailsCardHeaderComponent } from '@shared/components/details/details-card-header/details-card-header.component';
import { DetailsInfoFieldComponent } from '@shared/components/details/details-info-field/details-info-field.component';
import { DetailsInfoGridComponent } from '@shared/components/details/details-info-grid/details-info-grid.component';

import { EmptyStateComponent } from '@shared/components/ui/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '@shared/components/ui/loading-spinner/loading-spinner.component';
import { PageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';
import { TextBadgeComponent } from '@shared/components/ui/text-badge/text-badge.component';
import { PurchaseApplicationService } from '@features/procurement/purchases/services/application/purchase-application.service';
import {
  PurchaseStatus,
  getPurchaseStatusLabel,
} from '@features/procurement/purchases/models/enums/purchase-status.enum';

import { PanelCardComponent } from '@shared/components/ui/panel-card/panel-card.component';
import { BackButtonComponent } from '@shared/components/ui/back-button/back-button.component';
import { CodeBadgeComponent } from '@shared/components/ui/code-badge/code-badge.component';
import { CancelDialogService } from '@shared/services/cancel-dialog.service';
import { DeleteDialogService } from '@shared/services/delete-dialog.service';
import { PdfViewerService } from '@core/pdf-viewer';
import { PURCHASE_SUCCESS_MESSAGES } from '@features/procurement/purchases/messages/success-messages';
import { ConfirmPurchaseDialogComponent } from '@features/procurement/purchases/components/confirm-purchase-dialog/confirm-purchase-dialog.component';
@Component({
  selector: 'app-purchase-detail-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CodeBadgeComponent,
    BackButtonComponent,
    PanelCardComponent,
    TranslatePipe,
    LocalizedDatePipe,
    LocalizedNumberPipe,
    PermissionDirective,
    ButtonModule,
    TableModule,
    DetailActionsMenuComponent,
    DetailsCardHeaderComponent,
    DetailsInfoFieldComponent,
    DetailsInfoGridComponent,
    EmptyStateComponent,
    LoadingSpinnerComponent,
    PageHeaderComponent,
    TextBadgeComponent,
    ConfirmPurchaseDialogComponent,
  ],
  templateUrl: './purchase-detail-page.component.html',
})
export class PurchaseDetailPageComponent implements OnInit {
  private readonly navigationHistory = inject(NavigationHistoryService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly purchaseService = inject(PurchaseApplicationService);
  private readonly messageService = inject(MessageService);
  private readonly cancellation = inject(CancelDialogService);
  private readonly deletion = inject(DeleteDialogService);
  private readonly pdfViewerService = inject(PdfViewerService);

  readonly purchase = this.purchaseService.currentPurchase;
  readonly loading = this.purchaseService.loading;

  readonly PurchaseStatus = PurchaseStatus;
  readonly confirmDialogVisible = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.purchaseService.loadById(id).subscribe({
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar la compra. Es posible que no exista.',
            life: 5000,
          });
          this.router.navigate(['/procurement/purchases']);
        },
      });
    }
  }

  onBack(): void {
    this.navigationHistory.back(['/procurement/purchases']);
  }

  onEdit(): void {
    const id = this.purchase()?.id;
    if (id) this.router.navigate(['/procurement/purchases', id, 'edit']);
  }

  onCancelPurchase(): void {
    const purchase = this.purchase();
    if (!purchase) return;
    this.cancellation.open('purchases', purchase.id, purchase.purchaseNumber, () =>
      this.purchaseService.loadById(purchase.id).subscribe(),
    );
  }

  onDownloadPdf(): void {
    const purchase = this.purchase();
    if (!purchase) return;
    this.pdfViewerService.open({
      url: `/api/reports/purchases/${purchase.id}/pdf`,
      title: `Compra #${purchase.purchaseNumber}`,
      fileName: `compra-${purchase.purchaseNumber}.pdf`,
    });
  }

  onConfirm(): void {
    this.confirmDialogVisible.set(true);
  }

  onConfirmDialogConfirmed(purchaseId: string): void {
    this.confirmDialogVisible.set(false);
    this.purchaseService.confirm(purchaseId).subscribe({
      next: () => {
        this.messageService.add(PURCHASE_SUCCESS_MESSAGES.confirmed);
        this.purchaseService.loadById(purchaseId).subscribe();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al confirmar la compra. Por favor, intente nuevamente.',
          life: 5000,
        });
      },
    });
  }

  onConfirmDialogDismissed(): void {
    this.confirmDialogVisible.set(false);
  }

  onDelete(): void {
    const purchase = this.purchase();
    if (!purchase) return;
    this.deletion.open('purchases', purchase.id, purchase.purchaseNumber, () =>
      this.router.navigate(['/procurement/purchases']),
    );
  }

  getStatusLabel(status: PurchaseStatus): string {
    return getPurchaseStatusLabel(status);
  }

  getStatusVariant(status: PurchaseStatus): StatusVariant {
    return purchaseStatusVariant(status);
  }
}
