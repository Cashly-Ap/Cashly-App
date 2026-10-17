import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageService } from 'primeng/api';
import { FormContainerComponent } from '@core/forms/components/cards/form-container/form-container.component';
import { FormHeaderComponent } from '@core/forms/components/headers/form-header/form-header.component';
import { FormCardComponent } from '@core/forms/components/cards/form-card/form-card.component';
import { FormActionsComponent } from '@core/forms/components/headers/form-actions/form-actions.component';
import { PendingTabsService } from '@core/pending-tabs';
import { PENDING_TABS_CONFIG } from '@core/pending-tabs/constants';
import { PurchaseApplicationService } from '@features/procurement/purchases/services/application/purchase-application.service';
import { PurchaseItemsTableComponent } from '@features/procurement/purchases/components/purchase-items-table/purchase-items-table.component';
import {
  PurchaseFormData,
  PurchaseLineFormData,
} from '@features/procurement/purchases/models/interfaces/purchase-form-data.interface';
import { SupplierList } from '@features/partners/suppliers/models/interfaces/supplier-list.interface';
import { SupplierPickerDialogComponent } from '@features/procurement/purchases/components/supplier-picker-dialog/supplier-picker-dialog.component';
import { PURCHASE_SUCCESS_MESSAGES } from '@features/procurement/purchases/messages/success-messages';

@Component({
  selector: 'app-purchase-form-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    TextareaModule,
    DatePickerModule,
    FormContainerComponent,
    FormHeaderComponent,
    FormCardComponent,
    FormActionsComponent,
    PurchaseItemsTableComponent,
    SupplierPickerDialogComponent,
  ],
  templateUrl: './purchase-form-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PurchaseFormPageComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly purchaseService = inject(PurchaseApplicationService);
  private readonly messageService = inject(MessageService);
  private readonly pendingTabsService = inject(PendingTabsService);

  private autoSaveTimer: ReturnType<typeof setTimeout> | null = null;
  private isSubmitted = false;
  private tabId = '';

  readonly isEditMode = signal<boolean>(false);
  readonly purchaseId = signal<string | null>(null);
  readonly purchaseNumber = signal<string | null>(null);
  readonly isSubmitting = signal<boolean>(false);
  readonly selectedSupplier = signal<SupplierList | null>(null);
  readonly selectedSupplierLabel = signal<{ name: string; rif: string } | null>(null);
  readonly pickerVisible = signal<boolean>(false);

  readonly selectedSupplierId = computed(() => this.selectedSupplier()?.id ?? null);

  readonly submitTooltip = signal('');

  private readonly FIELD_LABELS: Record<string, string> = {
    supplierId: 'Proveedor',
  };

  readonly items = signal<PurchaseLineFormData[]>([]);

  readonly total = computed(() =>
    this.items().reduce((sum, i) => sum + i.quantity * i.unitCost, 0),
  );

  readonly form = this.fb.group({
    supplierId: ['', [Validators.required]],
    notes: [''],
  });

  ngOnInit(): void {
    this.form.statusChanges.subscribe(() => this.updateSubmitTooltip());
    this.updateSubmitTooltip();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.purchaseId.set(id);
      this.tabId = `purchases-edit-${id}`;
      this.loadPurchase(id);
    } else {
      const queryTabId = this.route.snapshot.queryParamMap.get('tabId');
      this.tabId = queryTabId || `purchases-create-${Date.now()}`;
      this.restoreFromPendingTab();
    }
    this.form.controls.notes.valueChanges.subscribe(() => this.scheduleAutoSave());
  }

  ngOnDestroy(): void {
    if (this.autoSaveTimer) clearTimeout(this.autoSaveTimer);
    if (this.form.dirty && !this.isSubmitted) {
      this.savePendingTab();
    }
  }

  private scheduleAutoSave(): void {
    if (this.isSubmitted) return;
    if (this.autoSaveTimer) clearTimeout(this.autoSaveTimer);
    this.autoSaveTimer = setTimeout(() => this.savePendingTab(), PENDING_TABS_CONFIG.DEBOUNCE_TIME);
  }

  private savePendingTab(): void {
    const label = this.selectedSupplierLabel();
    const formData: PurchaseFormData = {
      supplierId: this.form.value.supplierId ?? '',
      supplierName: label?.name ?? '',
      supplierRif: label?.rif ?? '',
      notes: this.form.value.notes ?? '',
      items: this.items(),
    };
    const title = this.purchaseNumber()
      ? `Editar Compra ${this.purchaseNumber()}`
      : this.isEditMode()
        ? 'Editar Compra'
        : 'Nueva Compra';
    const route = this.isEditMode()
      ? `/purchases/${this.purchaseId()}/edit`
      : `/purchases/new?tabId=${this.tabId}`;

    this.pendingTabsService.save(
      this.tabId,
      title,
      route,
      formData,
      this.isEditMode() ? 'edit' : 'create',
      'purchases',
    );
  }

  private restoreFromPendingTab(): void {
    const tab = this.pendingTabsService.get<PurchaseFormData>(this.tabId);
    if (!tab) return;
    this.form.patchValue({ supplierId: tab.formData.supplierId, notes: tab.formData.notes });
    this.items.set(tab.formData.items);
    if (tab.formData.supplierId) {
      this.selectedSupplier.set({ id: tab.formData.supplierId } as SupplierList);
      this.selectedSupplierLabel.set({
        name: tab.formData.supplierName,
        rif: tab.formData.supplierRif,
      });
    }
  }

  private markAsSubmitted(): void {
    this.isSubmitted = true;
    this.pendingTabsService.remove(this.tabId);
  }

  private updateSubmitTooltip(): void {
    const invalid = Object.entries(this.FIELD_LABELS)
      .filter(([key]) => this.form.get(key)?.invalid)
      .map(([, label]) => label);
    this.submitTooltip.set(invalid.length ? `Campos requeridos: ${invalid.join(', ')}` : '');
  }

  private loadPurchase(id: string): void {
    this.purchaseService.loadById(id).subscribe({
      next: (purchase) => {
        this.purchaseNumber.set(purchase.purchaseNumber ?? null);
        this.form.patchValue({ notes: purchase.notes ?? '' });
        this.selectedSupplierLabel.set({
          name: purchase.supplierName,
          rif: purchase.supplierRif,
        });
        this.form.patchValue({ supplierId: purchase.supplierId });
        this.selectedSupplier.set({ id: purchase.supplierId } as SupplierList);
        this.items.set(
          purchase.lines.map((line) => {
            return {
              productId: line.productId,
              productCode: line.productCode,
              productName: line.productName,
              quantity: line.quantity,
              unitCost: line.unitCost,
              stock: (line.stockItems ?? []).map((s) => ({
                warehouseId: s.warehouseId,
                warehouseName: s.warehouseName,
                warehouseCode: s.warehouseCode,
                quantity: s.quantity,
                reserved: s.reserved,
                available: s.available,
              })),
              warehouseAllocations: line.allocations.map((a) => ({
                warehouseId: a.warehouseId,
                warehouseCode: a.warehouseCode ?? '',
                warehouseName: a.warehouseName,
                available: 0,
                allocated: a.allocatedQuantity,
              })),
            };
          }),
        );
      },
    });
  }

  openPicker(): void {
    this.pickerVisible.set(true);
  }

  onSupplierSelected(supplier: SupplierList): void {
    this.selectedSupplier.set(supplier);
    this.selectedSupplierLabel.set({ name: supplier.alias, rif: supplier.legalName });
    this.form.patchValue({ supplierId: supplier.id });
    this.pickerVisible.set(false);
    this.scheduleAutoSave();
  }

  onPickerCancelled(): void {
    this.pickerVisible.set(false);
  }

  onItemsChange(updated: PurchaseLineFormData[]): void {
    this.items.set(updated);
    this.scheduleAutoSave();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.items().length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Debes agregar al menos un producto a la compra.',
        life: 4000,
      });
      return;
    }

    this.isSubmitting.set(true);

    const formValue = this.form.value;

    if (this.isEditMode() && this.purchaseId()) {
      this.purchaseService
        .update(this.purchaseId()!, {
          notes: formValue.notes ?? null,
          lines: this.items().map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            unitCost: i.unitCost,
            warehouseAllocations: i.warehouseAllocations
              .filter((a) => a.allocated > 0)
              .map((a) => ({
                warehouseId: a.warehouseId,
                quantity: a.allocated,
              })),
          })),
        })
        .subscribe({
          next: () => {
            this.isSubmitting.set(false);
            this.markAsSubmitted();
            this.messageService.add(PURCHASE_SUCCESS_MESSAGES.updated);
            this.router.navigate(['/purchases']);
          },
          error: () => {
            this.isSubmitting.set(false);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al actualizar la compra. Por favor, intente nuevamente.',
              life: 5000,
            });
          },
        });
    } else {
      this.purchaseService
        .create({
          supplierId: formValue.supplierId ?? '',
          notes: formValue.notes ?? null,
          lines: this.items().map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            unitCost: i.unitCost,
            warehouseAllocations: i.warehouseAllocations
              .filter((a) => a.allocated > 0)
              .map((a) => ({
                warehouseId: a.warehouseId,
                quantity: a.allocated,
              })),
          })),
        })
        .subscribe({
          next: () => {
            this.isSubmitting.set(false);
            this.markAsSubmitted();
            this.messageService.add(PURCHASE_SUCCESS_MESSAGES.created);
            this.router.navigate(['/purchases']);
          },
          error: () => {
            this.isSubmitting.set(false);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al crear la compra. Por favor, intente nuevamente.',
              life: 5000,
            });
          },
        });
    }
  }

  cancel(): void {
    this.router.navigate(['/purchases']);
  }
}
