import {
  ChangeDetectionStrategy,
  Component,
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
@Component({
  selector: 'app-confirm-purchase-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocumentConfirmationDialogComponent],
  templateUrl: './confirm-purchase-dialog.component.html',
})
export class ConfirmPurchaseDialogComponent {
  private readonly api = inject(PurchaseApiService);
  private requestVersion = 0;

  readonly purchaseId = input<string | null>(null);
  readonly visible = input<boolean>(false);
  readonly confirmed = output<string>();
  readonly cancelled = output<void>();

  readonly details = signal<PurchaseDetails | null>(null);
  readonly loading = signal(false);
  readonly confirming = signal(false);
  readonly error = signal<string | null>(null);

  readonly purchase = computed(() => this.details());
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
              label: 'finance.treasury.receivables.customerTaxId',
              value: purchase.supplierRif,
              monospace: true,
            },
            { label: 'finance.billing.returns.total', value: purchase.subtotal },
          ]
        : [],
      notice: {
        severity: 'warning',
        title: 'procurement.purchases.areYouSureYouWantToConfirmThisPurchase',
        description:
          'procurement.purchases.confirmingWillGenerateStockMovementsAndYouWillNoLongerBeAbleToEditThePurchase',
      },
      inventory: { rows, blocking: false },
      acceptLabel: 'procurement.purchases.confirmPurchase2',
      acceptIcon: 'pi pi-check',
      acceptSeverity: 'success',
      permissionAction: 'EXECUTE',
      requiredPermissions: ['INVENTORY:EXECUTE'],
    };
  });

  onDialogShow(): void {
    const id = this.purchaseId();
    if (!id || this.details()?.id === id) return;

    const version = ++this.requestVersion;
    this.details.set(null);
    this.loading.set(true);
    this.error.set(null);
    this.api.getById(id).subscribe({
      next: (result) => {
        if (version !== this.requestVersion) return;
        this.details.set(result);
        this.loading.set(false);
      },
      error: () => {
        if (version !== this.requestVersion) return;
        this.loading.set(false);
        this.error.set('Error al cargar los detalles de la compra.');
      },
    });
  }

  onConfirm(): void {
    const id = this.purchaseId();
    if (
      !id ||
      this.loading() ||
      this.error() ||
      this.confirming() ||
      this.details()?.id !== id ||
      !this.details()?.lines.length
    )
      return;

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
    this.loading.set(false);
    this.confirming.set(false);
    this.error.set(null);
  }

  availableStock(line: PurchaseDetails['lines'][number], warehouseId: string): number {
    return line.stockItems.find((stock) => stock.warehouseId === warehouseId)?.available ?? 0;
  }
}
