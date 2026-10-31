import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { InvoiceActionDialogService } from '@core/layouts/services/invoice-action-dialog.service';
import { InvoiceApplicationService } from '@features/finance/billing/invoices/services/application/invoice-application.service';
import { InvoiceApiService } from '@features/finance/billing/invoices/services/api/invoice-api.service';
import { InvoiceMapper } from '@features/finance/billing/invoices/services/mappers/invoice.mapper';
import { InvoiceList } from '@features/finance/billing/invoices/models/interfaces/invoice-list.interface';
import { CancelInvoiceDialogComponent } from '@features/finance/billing/invoices/components/cancel-invoice-dialog/cancel-invoice-dialog.component';
import {
  ConfirmInvoiceDialogComponent,
  ConfirmInvoiceSubmit,
} from '@features/finance/billing/invoices/components/confirm-invoice-dialog/confirm-invoice-dialog.component';
import { DuplicateInvoiceDialogComponent } from '@features/finance/billing/invoices/components/duplicate-invoice-dialog/duplicate-invoice-dialog.component';

@Component({
  selector: 'app-invoice-action-dialog-host',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ConfirmInvoiceDialogComponent,
    CancelInvoiceDialogComponent,
    DuplicateInvoiceDialogComponent,
  ],
  templateUrl: './invoice-action-dialog-host.component.html',
})
export class InvoiceActionDialogHostComponent {
  readonly actions = inject(InvoiceActionDialogService);
  private readonly invoiceService = inject(InvoiceApplicationService);
  private readonly invoiceApi = inject(InvoiceApiService);
  private readonly messages = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  readonly invoice = signal<InvoiceList | null>(null);
  readonly confirmVisible = signal(false);
  readonly cancelVisible = signal(false);
  readonly duplicateVisible = signal(false);
  readonly duplicateInvoiceId = signal('');
  readonly submitting = signal(false);

  private requestVersion = 0;

  constructor() {
    effect(() => {
      const request = this.actions.request();
      if (!request) return;
      const version = ++this.requestVersion;
      this.confirmVisible.set(false);
      this.cancelVisible.set(false);
      this.duplicateVisible.set(false);
      this.duplicateInvoiceId.set('');
      this.invoice.set(null);

      switch (request.action) {
        case 'confirm':
          this.confirmVisible.set(true);
          this.loadInvoice(request.invoiceId, version);
          return;
        case 'cancel':
          this.cancelVisible.set(true);
          this.loadInvoice(request.invoiceId, version);
          return;
        case 'duplicate':
          this.duplicateInvoiceId.set(request.invoiceId);
          this.duplicateVisible.set(true);
          return;
      }
    });
  }

  onConfirm(data: ConfirmInvoiceSubmit): void {
    const request = this.actions.request();
    if (!request) return;
    this.submitting.set(true);
    this.invoiceService
      .confirm(request.invoiceId, data)
      .pipe(
        finalize(() => this.submitting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => this.succeed('Factura confirmada exitosamente'),
        error: (err: { error?: { message?: string } }) =>
          this.fail(err?.error?.message || 'Error al confirmar.'),
      });
  }

  onCancelConfirm(event: { invoiceId: string; reason: string }): void {
    this.invoiceService
      .cancel(event.invoiceId, event.reason)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.succeed('Factura cancelada exitosamente'),
        error: (err: { error?: { message?: string } }) =>
          this.fail(err?.error?.message || 'Error al cancelar la factura.'),
      });
  }

  onDuplicateConfirm(event: { invoiceId: string; customerId?: string }): void {
    this.invoiceService
      .duplicate(event.invoiceId, event.customerId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.succeed('Factura duplicada exitosamente'),
        error: (err: { error?: { message?: string } }) =>
          this.fail(err?.error?.message || 'Error al duplicar la factura.'),
      });
  }

  onClose(): void {
    this.confirmVisible.set(false);
    this.cancelVisible.set(false);
    this.duplicateVisible.set(false);
    this.duplicateInvoiceId.set('');
    this.invoice.set(null);
    this.submitting.set(false);
    this.actions.close();
  }

  private loadInvoice(invoiceId: string, version: number): void {
    this.invoiceApi
      .getById(invoiceId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (details) => {
          if (version !== this.requestVersion) return;
          this.invoice.set(InvoiceMapper.toList(details));
        },
        error: () => this.fail('No se pudieron cargar los datos de la factura.'),
      });
  }

  private succeed(detail: string): void {
    this.messages.add({ severity: 'success', summary: 'Éxito', detail, life: 3000 });
    this.onClose();
  }

  private fail(detail: string): void {
    this.messages.add({ severity: 'error', summary: 'Error', detail, life: 5000 });
  }
}
