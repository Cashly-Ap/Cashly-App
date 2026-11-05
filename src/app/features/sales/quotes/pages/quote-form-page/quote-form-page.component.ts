import { TranslatePipe } from '@core/i18n/translate.pipe';
import { NavigationHistoryService } from '@core/navigation/navigation-history.service';
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

import { FormActionsComponent } from '@core/forms/components/headers/form-actions/form-actions.component';
import { PendingTabsService } from '@core/pending-tabs';
import { PENDING_TABS_CONFIG } from '@core/pending-tabs/constants';
import { QuoteApplicationService } from '@features/sales/quotes/services/application/quote-application.service';
import { OrderItemsTableComponent } from '@features/sales/orders/components/order-items-table/order-items-table.component';
import { SingleWarehouseResolverService } from '@features/inventory/warehouses/services/application/single-warehouse-resolver.service';
import { SingleWarehouseContext } from '@features/inventory/warehouses/models/interfaces/single-warehouse.interface';
import { QuoteFormData } from '@features/sales/quotes/models/interfaces/quote-form-data.interface';
import { OrderItemFormData } from '@features/sales/orders/models/interfaces/order-form-data.interface';
import { CustomerList } from '@features/partners/customers/models/interfaces/customer-list.interface';
import { CustomerPickerDialogComponent } from '@features/sales/orders/components/customer-picker-dialog/customer-picker-dialog.component';
import { QUOTE_SUCCESS_MESSAGES } from '@features/sales/quotes/messages/success-messages';

import { PanelCardComponent } from '@shared/components/ui/panel-card/panel-card.component';
import { PickerTriggerComponent } from '@shared/components/ui/picker-trigger/picker-trigger.component';
@Component({
  selector: 'app-quote-form-page',
  standalone: true,
  imports: [
    PickerTriggerComponent,
    PanelCardComponent,
    TranslatePipe,
    ReactiveFormsModule,
    ButtonModule,
    TextareaModule,
    DatePickerModule,
    FormContainerComponent,
    FormHeaderComponent,
    FormActionsComponent,
    OrderItemsTableComponent,
    CustomerPickerDialogComponent,
  ],
  templateUrl: './quote-form-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuoteFormPageComponent implements OnInit, OnDestroy {
  private readonly navigationHistory = inject(NavigationHistoryService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly quoteService = inject(QuoteApplicationService);
  private readonly singleWarehouseResolver = inject(SingleWarehouseResolverService);
  private readonly messageService = inject(MessageService);
  private readonly pendingTabsService = inject(PendingTabsService);

  private autoSaveTimer: ReturnType<typeof setTimeout> | null = null;
  private isSubmitted = false;
  private tabId = '';

  readonly isEditMode = signal<boolean>(false);
  readonly quoteId = signal<string | null>(null);
  readonly quoteNumber = signal<string | null>(null);
  readonly isSubmitting = signal<boolean>(false);
  readonly selectedCustomer = signal<CustomerList | null>(null);
  readonly selectedCustomerLabel = signal<{ name: string; rif: string } | null>(null);
  readonly pickerVisible = signal<boolean>(false);

  readonly selectedCustomerId = computed(() => this.selectedCustomer()?.id ?? null);
  readonly singleWarehouse = signal<SingleWarehouseContext | null>(null);

  readonly submitTooltip = signal('');

  private readonly FIELD_LABELS: Record<string, string> = {
    customerId: 'Cliente',
  };

  readonly items = signal<OrderItemFormData[]>([]);

  readonly total = computed(() =>
    this.items().reduce((sum, i) => sum + i.quantity * i.unitPrice, 0),
  );

  readonly form = this.fb.group({
    customerId: ['', [Validators.required]],
    notes: [''],
  });

  ngOnInit(): void {
    this.form.statusChanges.subscribe(() => this.updateSubmitTooltip());
    this.updateSubmitTooltip();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.quoteId.set(id);
      this.tabId = `quotes-edit-${id}`;
      this.loadQuote(id);
    } else {
      const queryTabId = this.route.snapshot.queryParamMap.get('tabId');
      this.tabId = queryTabId || `quotes-create-${Date.now()}`;
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
    const label = this.selectedCustomerLabel();
    const formData: QuoteFormData = {
      customerId: this.form.value.customerId ?? '',
      customerName: label?.name ?? '',
      customerRif: label?.rif ?? '',
      notes: this.form.value.notes ?? '',
      items: this.items(),
    };
    const title = this.quoteNumber()
      ? `Editar Presupuesto ${this.quoteNumber()}`
      : this.isEditMode()
        ? 'Editar Presupuesto'
        : 'Nuevo Presupuesto';
    const route = this.isEditMode()
      ? `/presupuestos/${this.quoteId()}/edit`
      : `/presupuestos/new?tabId=${this.tabId}`;

    this.pendingTabsService.save(
      this.tabId,
      title,
      route,
      formData,
      this.isEditMode() ? 'edit' : 'create',
      'quotes',
    );
  }

  private restoreFromPendingTab(): void {
    const tab = this.pendingTabsService.get<QuoteFormData>(this.tabId);
    if (!tab) return;
    this.form.patchValue({ customerId: tab.formData.customerId, notes: tab.formData.notes });
    this.items.set(tab.formData.items);
    if (tab.formData.customerId) {
      this.selectedCustomer.set({ id: tab.formData.customerId } as CustomerList);
      this.selectedCustomerLabel.set({
        name: tab.formData.customerName,
        rif: tab.formData.customerRif,
      });
      this.resolveSingleWarehouse(tab.formData.customerId);
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

  private loadQuote(id: string): void {
    this.quoteService.loadById(id).subscribe({
      next: (quote) => {
        this.quoteNumber.set(quote.quoteNumber ?? null);
        this.form.patchValue({ notes: quote.notes ?? '' });
        this.selectedCustomerLabel.set({
          name: quote.customerName,
          rif: quote.customerRif,
        });
        this.form.patchValue({ customerId: quote.customerId });
        this.selectedCustomer.set({ id: quote.customerId } as CustomerList);
        this.resolveSingleWarehouse(quote.customerId);
        this.items.set(
          quote.lines.map((line) => {
            return {
              productId: line.productId,
              productCode: line.productCode,
              productName: line.productName,
              quantity: line.quantity,
              unitPrice: line.unitPrice,
              stock: (line.warehouseStocks ?? []).map((stock) => ({
                warehouseId: stock.warehouseId,
                warehouseCode: '',
                warehouseName: stock.warehouseName,
                quantity: stock.available,
                reserved: 0,
                available: stock.available,
              })),
              warehouseAllocations: line.allocations.map((a) => {
                const stockInfo = line.warehouseStocks?.find(
                  (ws) => ws.warehouseId === a.warehouseId,
                );
                return {
                  warehouseId: a.warehouseId,
                  warehouseCode: a.warehouseCode ?? '',
                  warehouseName: a.warehouseName,
                  available: stockInfo?.available ?? 0,
                  allocated: a.allocatedQuantity,
                };
              }),
            };
          }),
        );
      },
    });
  }

  openPicker(): void {
    this.pickerVisible.set(true);
  }

  onCustomerSelected(customer: CustomerList): void {
    this.selectedCustomer.set(customer);
    this.selectedCustomerLabel.set({ name: customer.alias, rif: customer.legalName });
    this.form.patchValue({ customerId: customer.id });
    this.pickerVisible.set(false);
    this.resolveSingleWarehouse(customer.id);
    this.scheduleAutoSave();
  }

  private resolveSingleWarehouse(customerId: string): void {
    this.singleWarehouseResolver.resolveForCustomer(customerId).subscribe({
      next: (warehouse) => this.singleWarehouse.set(warehouse),
      error: () => this.singleWarehouse.set(null),
    });
  }

  onPickerCancelled(): void {
    this.pickerVisible.set(false);
  }

  onItemsChange(updated: OrderItemFormData[]): void {
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
        detail: 'Debes agregar al menos un producto al presupuesto.',
        life: 4000,
      });
      return;
    }

    this.isSubmitting.set(true);

    const formValue = this.form.value;

    if (this.isEditMode() && this.quoteId()) {
      this.quoteService
        .update(this.quoteId()!, {
          notes: formValue.notes ?? null,
          lines: this.items().map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            warehouseAllocations: i.warehouseAllocations
              .filter((a) => a.allocated > 0)
              .map((a) => ({
                warehouseId: a.warehouseId,
                allocatedQuantity: a.allocated,
              })),
          })),
        })
        .subscribe({
          next: (quote) => {
            this.isSubmitting.set(false);
            this.markAsSubmitted();
            this.messageService.add(QUOTE_SUCCESS_MESSAGES.updated);
            this.router.navigate(['/sales/quotes', quote.id]);
          },
          error: () => {
            this.isSubmitting.set(false);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al actualizar el presupuesto. Por favor, intente nuevamente.',
              life: 5000,
            });
          },
        });
    } else {
      this.quoteService
        .create({
          customerId: formValue.customerId ?? '',
          notes: formValue.notes ?? null,
          lines: this.items().map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            warehouseAllocations: i.warehouseAllocations
              .filter((a) => a.allocated > 0)
              .map((a) => ({
                warehouseId: a.warehouseId,
                allocatedQuantity: a.allocated,
              })),
          })),
        })
        .subscribe({
          next: (quote) => {
            this.isSubmitting.set(false);
            this.markAsSubmitted();
            this.messageService.add(QUOTE_SUCCESS_MESSAGES.created);
            this.router.navigate(['/sales/quotes', quote.id]);
          },
          error: () => {
            this.isSubmitting.set(false);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al crear el presupuesto. Por favor, intente nuevamente.',
              life: 5000,
            });
          },
        });
    }
  }

  cancel(): void {
    this.navigationHistory.back(['/sales/quotes']);
  }
}
