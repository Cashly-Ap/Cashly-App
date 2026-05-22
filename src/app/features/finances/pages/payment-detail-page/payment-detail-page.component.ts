import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MainLayoutComponent } from '@core/layouts/main-layout.component';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';
import {
  DetailsCardComponent,
  DetailsCardHeaderComponent,
  DetailsInfoFieldComponent,
  DetailsInfoGridComponent,
  DetailsSectionCardComponent,
} from '@shared/components/details';
import {
  EmptyStateComponent,
  LoadingSpinnerComponent,
  PageHeaderComponent,
  TextBadgeComponent,
} from '@shared/components/ui';
import { CancelPaymentDialogComponent } from '@features/finances/components/cancel-payment-dialog/cancel-payment-dialog.component';
import { PaymentPdfModalComponent } from '@features/reports/finances/components/payment-pdf-modal/payment-pdf-modal.component';
import { FinanceApplicationService } from '@features/finances/services/application/finance-application.service';
import { PaymentStatus, getPaymentStatusLabel } from '@features/finances/models/enums/payment-status.enum';
import { PaymentType, getPaymentTypeLabel } from '@features/finances/models/enums/payment-type.enum';

@Component({
  selector: 'app-payment-detail-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    DecimalPipe,
    MainLayoutComponent,
    ButtonModule,
    TableModule,
    DetailsCardComponent,
    DetailsCardHeaderComponent,
    DetailsInfoFieldComponent,
    DetailsInfoGridComponent,
    DetailsSectionCardComponent,
    EmptyStateComponent,
    LoadingSpinnerComponent,
    PageHeaderComponent,
    TextBadgeComponent,
    CancelPaymentDialogComponent,
    PaymentPdfModalComponent,
  ],
  templateUrl: './payment-detail-page.component.html',
})
export class PaymentDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly financeService = inject(FinanceApplicationService);
  private readonly messageService = inject(MessageService);

  readonly payment = this.financeService.selectedPayment;
  readonly loading = this.financeService.loading;

  readonly PaymentStatus = PaymentStatus;

  readonly cancelDialogVisible = signal(false);
  readonly pdfModalVisible = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.financeService.loadPaymentById(id).subscribe({
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar el pago. Es posible que no exista.',
            life: 5000,
          });
          this.router.navigate(['/finances', 'pagos']);
        },
      });
    }
  }

  onBack(): void {
    this.router.navigate(['/finances', 'pagos']);
  }

  onCancel(): void {
    this.cancelDialogVisible.set(true);
  }

  onCancelDialogConfirmed(event: { paymentId: string; reason: string }): void {
    this.cancelDialogVisible.set(false);
    this.financeService.cancelPayment(event.paymentId, event.reason).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Pago cancelado exitosamente',
          life: 3000,
        });
        this.router.navigate(['/finances', 'pagos']);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cancelar el pago. Por favor, intente nuevamente.',
          life: 5000,
        });
      },
    });
  }

  onCancelDialogDismissed(): void {
    this.cancelDialogVisible.set(false);
  }

  onGeneratePdf(): void {
    this.pdfModalVisible.set(true);
  }

  onPdfModalDismissed(): void {
    this.pdfModalVisible.set(false);
  }

  getStatusLabel(status: PaymentStatus): string {
    return getPaymentStatusLabel(status);
  }

  getStatusVariant(status: PaymentStatus): 'success' | 'danger' | 'info' | 'label' {
    const variants: Record<PaymentStatus, 'success' | 'danger' | 'info' | 'label'> = {
      [PaymentStatus.DRAFT]: 'label',
      [PaymentStatus.APPLIED]: 'success',
      [PaymentStatus.PARTIALLY_APPLIED]: 'info',
      [PaymentStatus.CANCELLED]: 'danger',
    };
    return variants[status] ?? 'label';
  }

  getPaymentTypeLabel(type: PaymentType): string {
    return getPaymentTypeLabel(type);
  }

  canCancel(status: PaymentStatus): boolean {
    return status !== PaymentStatus.DRAFT && status !== PaymentStatus.CANCELLED;
  }
}
