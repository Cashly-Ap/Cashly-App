import { LocalizedDatePipe, LocalizedCurrencyPipe } from '@core/i18n/localized-format.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { connectListNavigation } from '@shared/components/list/list-navigation.service';
import { ListAction } from '@shared/components/list/list-action-buttons/list-action-buttons.component';
import { PermissionDirective } from '@features/platform/auth/authorization/directives/permission.directive';
import {
  Component,
  computed,
  inject,
  signal,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  effect,
  input,
  output,
} from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
import { ReceivablesApiService } from '@features/finance/treasury/receivables/services/api/receivables-api.service';
import { PendingPayment } from '@features/finance/treasury/receivables/models/interfaces/pending-payment.interface';
import { ImageViewerDialogComponent } from '@shared/components/ui/image-viewer-dialog/image-viewer-dialog.component';

const IMAGE_EXTENSION_PATTERN = /\.(png|jpe?g|gif|webp|svg|bmp)(\?.*)?$/i;

@Component({
  selector: 'app-pending-payments-tab',
  standalone: true,
  imports: [
    TranslatePipe,
    LocalizedDatePipe,
    LocalizedCurrencyPipe,
    PermissionDirective,
    CommonModule,
    CurrencyPipe,
    DatePipe,
    FormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
    TooltipModule,
    ImageViewerDialogComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pending-payments-tab.component.html',
})
export class PendingPaymentsTabComponent implements OnInit, OnDestroy {
  private readonly api = inject(ReceivablesApiService);
  private readonly messageService = inject(MessageService);
  private readonly destroy$ = new Subject<void>();

  readonly payments = signal<PendingPayment[]>([]);
  readonly loading = signal(false);
  readonly focusPaymentId = input<string | null>(null);
  readonly focusHandled = output<string>();
  readonly paymentValidated = output<void>();

  readonly approveDialogVisible = signal(false);
  readonly rejectDialogVisible = signal(false);
  readonly selectedPayment = signal<PendingPayment | null>(null);
  readonly reason = signal('');
  readonly submitting = signal(false);
  readonly voucherViewerVisible = signal(false);
  readonly voucherViewerUrl = signal<string | null>(null);
  private readonly handledFocusId = signal<string | null>(null);

  private readonly navigationSearch = signal('');
  private readonly navigationFirst = signal(0);
  private readonly navigationRows = signal(10);
  private readonly navigationPayments = computed(() => {
    const term = this.navigationSearch().trim().toLocaleLowerCase();
    return this.payments().filter((payment) =>
      `${payment.paymentNumber} ${payment.customerName} ${payment.invoiceNumber} ${payment.referenceNumber ?? ''}`
        .toLocaleLowerCase()
        .includes(term),
    );
  });
  private readonly navigationAction = signal<'APPROVE' | 'REJECT' | undefined>(undefined);
  private readonly listNavigation = connectListNavigation({
    records: () =>
      this.navigationPayments().slice(
        this.navigationFirst(),
        this.navigationFirst() + this.navigationRows(),
      ),
    loading: () => this.loading(),
    total: () => this.navigationPayments().length,
    first: () => this.navigationFirst(),
    rows: () => this.navigationRows(),
    onActionChange: (label) => {
      this.navigationAction.set(
        label === 'Aprobar pago' ? 'APPROVE' : label === 'Rechazar pago' ? 'REJECT' : undefined,
      );
      if (label === null) this.load();
    },
    search: (term) => {
      this.load();
      this.navigationSearch.set(term);
      this.navigationFirst.set(0);
    },
    paginate: (event) => {
      this.navigationFirst.set(event.first);
      this.navigationRows.set(event.rows);
    },
    label: (record) => record.paymentNumber,
    description: (record) => `${record.customerName} · ${record.invoiceNumber}`,
    actions: (record) => this.navigationActions(record),
    acceptsAction: (label) => ['Aprobar pago', 'Rechazar pago', 'Ver justificante'].includes(label),
  });

  private navigationActions(payment: PendingPayment): ListAction[] {
    return [
      {
        label: 'Aprobar pago',
        icon: 'pi pi-check',
        requiredAction: 'EXECUTE',
        command: () => this.openApprove(payment),
      },
      {
        label: 'Rechazar pago',
        icon: 'pi pi-times',
        requiredAction: 'EXECUTE',
        danger: true,
        command: () => this.openReject(payment),
      },
      {
        label: 'Ver justificante',
        icon: 'pi pi-paperclip',
        requiredAction: 'READ',
        disabled: !payment.voucherUrl,
        command: () => this.openVoucher(payment),
      },
    ];
  }

  constructor() {
    effect(() => {
      const focusId = this.focusPaymentId();
      if (!focusId || focusId === this.handledFocusId()) return;
      const payment = this.payments().find((item) => item.id === focusId);
      if (!payment) return;
      this.handledFocusId.set(focusId);
      this.openApprove(payment);
      this.focusHandled.emit(focusId);
    });
  }

  ngOnInit(): void {
    this.load();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  load(): void {
    this.loading.set(true);
    this.api
      .listPendingPayments(this.navigationAction())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.payments.set(data);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  openApprove(payment: PendingPayment): void {
    this.selectedPayment.set(payment);
    this.reason.set('');
    this.approveDialogVisible.set(true);
  }

  openReject(payment: PendingPayment): void {
    this.selectedPayment.set(payment);
    this.reason.set('');
    this.rejectDialogVisible.set(true);
  }

  submitApprove(): void {
    if (!this.selectedPayment() || !this.reason().trim()) return;
    this.submitting.set(true);
    this.api
      .approvePayment(this.selectedPayment()!.id, this.reason().trim())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.approveDialogVisible.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Pago aprobado',
            detail: 'El pago ha sido verificado y aprobado.',
          });
          this.paymentValidated.emit();
          this.load();
        },
        error: () => {
          this.submitting.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo aprobar el pago.',
          });
        },
      });
  }

  submitReject(): void {
    if (!this.selectedPayment() || !this.reason().trim()) return;
    this.submitting.set(true);
    this.api
      .rejectPayment(this.selectedPayment()!.id, this.reason().trim())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.rejectDialogVisible.set(false);
          this.messageService.add({
            severity: 'warn',
            summary: 'Pago rechazado',
            detail: 'El pago ha sido rechazado.',
          });
          this.paymentValidated.emit();
          this.load();
        },
        error: () => {
          this.submitting.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo rechazar el pago.',
          });
        },
      });
  }

  formatCustomer(payment: PendingPayment): string {
    if (payment.customerName) return payment.customerName;
    return payment.createdByName || 'Automático';
  }

  openVoucher(payment: PendingPayment): void {
    const url = payment.voucherUrl;
    if (!url) return;
    if (IMAGE_EXTENSION_PATTERN.test(url)) {
      this.voucherViewerUrl.set(url);
      this.voucherViewerVisible.set(true);
      return;
    }
    window.open(url, '_blank');
  }
}
