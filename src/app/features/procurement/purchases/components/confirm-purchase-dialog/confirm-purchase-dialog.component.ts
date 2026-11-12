import {
  ChangeDetectionStrategy,
  Component,
  OnChanges,
  inject,
  input,
  output,
  signal,
  computed,
} from '@angular/core';
import { PurchaseApiService } from '@features/procurement/purchases/services/api/purchase-api.service';
import { PurchaseDetails } from '@features/procurement/purchases/models/interfaces/purchase-details.interface';
import { DocumentConfirmationDialogComponent } from '@shared/components/document-confirmation-dialog/document-confirmation-dialog.component';
import { DocumentConfirmationModel } from '@shared/models/document-confirmation';
import { PurchaseStatus } from '@features/procurement/purchases/models/enums/purchase-status.enum';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';
import { PayablesApiService } from '@features/finance/treasury/payables/services/api/payables-api.service';
import { SupplierDebtSummary } from '@features/finance/treasury/payables/models/interfaces/supplier-debt-summary.interface';

const QUANTITY_TOLERANCE = 0.000001;
@Component({
  selector: 'app-confirm-purchase-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocumentConfirmationDialogComponent],
  templateUrl: './confirm-purchase-dialog.component.html',
})
export class ConfirmPurchaseDialogComponent implements OnChanges {
  private readonly api = inject(PurchaseApiService);
  private readonly payablesApi = inject(PayablesApiService);
  private requestVersion = 0;

  readonly purchaseId = input<string | null>(null);
  readonly visible = input<boolean>(false);
  readonly confirmed = output<string>();
  readonly cancelled = output<void>();

  readonly details = signal<PurchaseDetails | null>(null);
  readonly loading = signal(false);
  readonly confirming = signal(false);
  readonly error = signal<string | null>(null);
  readonly supplierCredit = signal<SupplierDebtSummary | null>(null);

  readonly purchase = computed(() => this.details());
  readonly creditExceeded = computed(() => {
    const credit = this.supplierCredit();
    const purchase = this.details();
    if (!credit || !purchase) return false;
    return purchase.subtotal > credit.availableCredit;
  });
  readonly previewComplete = computed(() => {
    const purchase = this.details();
    return (
      !!purchase?.lines.length &&
      purchase.lines.every(
        (line) =>
          Number.isFinite(line.quantity) &&
          line.quantity > 0 &&
          line.allocations.length > 0 &&
          line.allocations.every(
            (allocation) =>
              !!allocation.warehouseId &&
              Number.isFinite(allocation.allocatedQuantity) &&
              allocation.allocatedQuantity > 0,
          ) &&
          Math.abs(
            line.allocations.reduce(
              (total, allocation) => total + allocation.allocatedQuantity,
              0,
            ) - line.quantity,
          ) < QUANTITY_TOLERANCE,
      )
    );
  });
  readonly canConfirm = computed(
    () =>
      this.details()?.id === this.purchaseId() &&
      this.details()?.status === PurchaseStatus.DRAFT &&
      this.previewComplete() &&
      !this.loading() &&
      !this.error() &&
      !this.confirming(),
  );
  readonly confirmationModel = computed<DocumentConfirmationModel>(() => {
    const purchase = this.details();
    const rows =
      purchase?.lines.flatMap((line) =>
        line.allocations.map((allocation) => {
          const available = this.availableStock(line, allocation.warehouseId);
          return {
            productName: line.productName,
            productCode: line.productCode,
            warehouseName: allocation.warehouseName,
            quantity: allocation.allocatedQuantity,
            available,
            availableAfter: available + allocation.allocatedQuantity,
            sufficient: true,
          };
        }),
      ) ?? [];
    return {
      title: 'procurement.purchases.confirmPurchase2',
      subtitle: 'procurement.purchases.reviewTheDetailsBeforeConfirmingThePurchase',
      icon: 'pi-check-circle',
      summaryFields: purchase
        ? [
            {
              label: 'procurement.purchases.purchase2',
              value: `#${purchase.purchaseNumber}`,
              monospace: true,
            },
            { label: 'procurement.purchases.supplier2', value: purchase.supplierName },
            {
              label: 'procurement.purchases.taxId',
              value: purchase.supplierRif,
              monospace: true,
            },
            { label: 'shared.total', value: purchase.subtotal },
            ...(this.supplierCredit()
              ? [
                  {
                    label: 'procurement.purchases.creditLimit',
                    value: this.formatMoney(this.supplierCredit()!.creditLimit),
                  },
                  {
                    label: 'procurement.purchases.availableCredit',
                    value: this.formatMoney(this.supplierCredit()!.availableCredit),
                  },
                  {
                    label: 'procurement.purchases.currentDebt',
                    value: this.formatMoney(this.supplierCredit()!.totalDebt),
                  },
                ]
              : []),
          ]
        : [],
      notice: this.creditExceeded()
        ? {
            severity: 'warning',
            title: 'procurement.purchases.creditLimitExceeded',
            description:
              'procurement.purchases.confirmingWillExceedTheSupplierCreditLimitReviewTheDetailsBeforeContinuing',
          }
        : {
            severity: 'info',
            title: 'procurement.purchases.areYouSureYouWantToConfirmThisPurchase',
            description:
              'procurement.purchases.confirmingWillGenerateStockMovementsAndYouWillNoLongerBeAbleToEditThePurchase',
          },
      inventory: { rows, blocking: false },
      acceptLabel: 'procurement.purchases.confirmPurchase2',
      acceptIcon: 'pi pi-check',
      acceptSeverity: 'success',
      permissionAction: 'CONFIRM',
      permissionModule: BusinessModule.PURCHASES,
    };
  });

  ngOnChanges(): void {
    this.reset();
    if (this.visible() && this.purchaseId()) this.onDialogShow();
  }

  onDialogShow(): void {
    const id = this.purchaseId();
    if (!id || this.loading() || this.details()?.id === id) return;

    const version = ++this.requestVersion;
    this.details.set(null);
    this.loading.set(true);
    this.error.set(null);
    this.api.getById(id).subscribe({
      next: (result) => {
        if (version !== this.requestVersion) return;
        if (result.id !== id) {
          this.error.set('procurement.purchases.confirmationPreviewUnavailable');
          this.loading.set(false);
          return;
        }
        this.details.set(result);
        this.loadSupplierCredit(result.supplierId);
        this.loading.set(false);
        if (!this.previewComplete()) {
          this.error.set('procurement.purchases.confirmationPreviewIncomplete');
        }
      },
      error: () => {
        if (version !== this.requestVersion) return;
        this.loading.set(false);
        this.error.set('procurement.purchases.confirmationPreviewUnavailable');
      },
    });
  }

  onConfirm(): void {
    const id = this.purchaseId();
    if (!id || !this.canConfirm()) return;

    this.confirming.set(true);
    this.confirmed.emit(id);
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  onHide(): void {
    this.reset();
  }

  reset(): void {
    ++this.requestVersion;
    this.details.set(null);
    this.supplierCredit.set(null);
    this.loading.set(false);
    this.confirming.set(false);
    this.error.set(null);
  }

  availableStock(line: PurchaseDetails['lines'][number], warehouseId: string): number {
    return line.stockItems.find((stock) => stock.warehouseId === warehouseId)?.available ?? 0;
  }

  private loadSupplierCredit(supplierId: string): void {
    this.payablesApi.getSupplierDebt(supplierId).subscribe({
      next: (credit) => this.supplierCredit.set(credit),
      error: () => this.supplierCredit.set(null),
    });
  }

  private formatMoney(value: number): string {
    return `$${value.toFixed(2)}`;
  }
}
