import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
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
import { DuplicateInvoiceDialogComponent } from '@features/invoices/components/duplicate-invoice-dialog/duplicate-invoice-dialog.component';
import { ReturnFormDialogComponent } from '@features/returns/components/return-form-dialog/return-form-dialog.component';
import { NoteFormDialogComponent } from '@shared/ui/note-form-dialog';
import { InvoiceApplicationService } from '@features/invoices/services/application/invoice-application.service';
import { InvoiceStatus, getInvoiceStatusLabel } from '@features/invoices/models/enums/invoice-status.enum';
import { PaymentType, getPaymentTypeLabel } from '@features/invoices/models/enums/payment-type.enum';

@Component({
  selector: 'app-invoice-detail-page',
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
    DuplicateInvoiceDialogComponent,
    ReturnFormDialogComponent,
    NoteFormDialogComponent,
  ],
  templateUrl: './invoice-detail-page.component.html',
})
export class InvoiceDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly invoiceService = inject(InvoiceApplicationService);
  private readonly messageService = inject(MessageService);

  readonly invoice = this.invoiceService.currentInvoice;
  readonly loading = this.invoiceService.loading;

  readonly creditNotes = computed(() =>
    this.invoice()?.notesList?.filter(n => n.type === 'CREDIT') ?? []
  );
  readonly debitNotes = computed(() =>
    this.invoice()?.notesList?.filter(n => n.type === 'DEBIT') ?? []
  );

  readonly InvoiceStatus = InvoiceStatus;

  readonly duplicateDialogVisible = signal(false);
  readonly returnDialogVisible = signal(false);
  readonly noteDialogVisible = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.invoiceService.loadById(id).subscribe({
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar la factura. Es posible que no exista.',
            life: 5000,
          });
          this.router.navigate(['/invoices']);
        },
      });
    }
  }

  onBack(): void {
    this.router.navigate(['/invoices']);
  }

  onEdit(): void {
    const id = this.invoice()?.id;
    if (id) this.router.navigate(['/invoices', id, 'edit']);
  }

  onDuplicate(): void {
    this.duplicateDialogVisible.set(true);
  }

  onDuplicateDialogConfirmed(invoiceId: string): void {
    this.duplicateDialogVisible.set(false);
    this.invoiceService.duplicate(invoiceId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Factura duplicada exitosamente',
          life: 3000,
        });
        this.router.navigate(['/invoices']);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al duplicar la factura. Por favor, intente nuevamente.',
          life: 5000,
        });
      },
    });
  }

  onDuplicateDialogDismissed(): void {
    this.duplicateDialogVisible.set(false);
  }

  onReturnDialogOpen(): void {
    this.returnDialogVisible.set(true);
  }

  onReturnDialogConfirmed(): void {
    this.returnDialogVisible.set(false);
  }

  onReturnDialogDismissed(): void {
    this.returnDialogVisible.set(false);
  }

  onNoteDialogOpen(): void {
    this.noteDialogVisible.set(true);
  }

  onNoteDialogConfirmed(): void {
    this.noteDialogVisible.set(false);
    const id = this.invoice()?.id;
    if (id) {
      this.invoiceService.loadById(id).subscribe();
    }
  }

  onNoteDialogDismissed(): void {
    this.noteDialogVisible.set(false);
  }

  getStatusLabel(status: InvoiceStatus): string {
    return getInvoiceStatusLabel(status);
  }

  getStatusVariant(status: InvoiceStatus): 'success' | 'danger' | 'info' | 'label' {
    const variants: Record<InvoiceStatus, 'success' | 'danger' | 'info' | 'label'> = {
      [InvoiceStatus.DRAFT]: 'label',
      [InvoiceStatus.PENDING_PAYMENT]: 'info',
      [InvoiceStatus.PARTIALLY_PAID]: 'info',
      [InvoiceStatus.PAID]: 'success',
      [InvoiceStatus.CANCELLED]: 'danger',
    };
    return variants[status] ?? 'label';
  }

  getPaymentTypeLabel(paymentType: PaymentType): string {
    return getPaymentTypeLabel(paymentType);
  }
}
