import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { MainLayoutComponent } from '@core/layouts/main-layout.component';
import { FormContainerComponent } from '@core/forms/components/cards/form-container/form-container.component';
import { FormHeaderComponent } from '@core/forms/components/headers/form-header/form-header.component';
import { FormCardComponent } from '@core/forms/components/cards/form-card/form-card.component';
import { FormActionsComponent } from '@core/forms/components/headers/form-actions/form-actions.component';
import { PendingTabsService } from '@core/pending-tabs';
import { PENDING_TABS_CONFIG } from '@core/pending-tabs/constants';
import { InvoiceApplicationService } from '@features/invoices/services/application/invoice-application.service';
import { OrderItemsTableComponent } from '@features/orders/components/order-items-table/order-items-table.component';
import { OrderItemFormData } from '@features/orders/models/interfaces';
import { CustomerList } from '@features/customers/models/interfaces';
import { CustomerPickerDialogComponent } from '@features/orders/components/customer-picker-dialog/customer-picker-dialog.component';
import { PaymentType, PAYMENT_TYPE_LABELS } from '@features/invoices/models/enums';
import { InvoiceFormData } from '@features/invoices/models/interfaces';
import { INVOICE_SUCCESS_MESSAGES } from '@features/invoices/messages';
import { ReceivablesApiService } from '@features/receivables/services/api/receivables-api.service';
import { CreditStatusResponse } from '@features/receivables/models/interfaces';
import { CustomerBalanceApiService } from '@features/customers/services/api/customer-balance-api.service';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-invoice-form-page',
  standalone: true,
  imports: [
    ReactiveFormsModule, DecimalPipe,
    ButtonModule, TextareaModule, SelectModule, ToastModule,
    MainLayoutComponent, FormContainerComponent, FormHeaderComponent,
    FormCardComponent, FormActionsComponent,
    OrderItemsTableComponent, CustomerPickerDialogComponent,
  ],
  providers: [MessageService],
  templateUrl: './invoice-form-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceFormPageComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly invoiceService = inject(InvoiceApplicationService);
  private readonly messageService = inject(MessageService);
  private readonly pendingTabsService = inject(PendingTabsService);
  private readonly receivablesApi = inject(ReceivablesApiService);
  private readonly balanceApi = inject(CustomerBalanceApiService);

  private autoSaveTimer: ReturnType<typeof setTimeout> | null = null;
  private isSubmitted = false;
  private tabId = '';
  readonly isEditMode = signal<boolean>(false);
  readonly invoiceId = signal<string | null>(null);
  readonly invoiceNumber = signal<string | null>(null);
  readonly isSubmitting = signal<boolean>(false);
  readonly selectedCustomer = signal<CustomerList | null>(null);
  readonly selectedCustomerLabel = signal<{ alias: string; legalName: string } | null>(null);
  readonly pickerVisible = signal<boolean>(false);
  readonly selectedCustomerId = computed(() => this.selectedCustomer()?.id ?? null);
  readonly submitTooltip = signal('');

  readonly creditStatus = signal<CreditStatusResponse | null>(null);
  readonly customerBalance = signal(0);

  readonly creditInfo = computed(() => {
    const s = this.creditStatus();
    if (!s) return null;
    return { creditLimit: s.creditLimit, customerBalance: s.customerBalance, availableCredit: s.availableCredit };
  });

  readonly creditWarningMessage = computed(() => {
    const status = this.creditStatus();
    const paymentType = this.form.get('paymentType')?.value;
    const total = this.total();
    if (!status || paymentType !== PaymentType.CREDIT) return null;
    if (status.availableCredit >= total && !status.hasOverdue && status.canCreateCreditInvoice) return null;
    return {
      hasOverdue: status.hasOverdue,
      canCreateCreditInvoice: status.canCreateCreditInvoice,
      creditLimit: status.creditLimit,
      availableCredit: status.availableCredit,
      invoiceTotal: total,
      message: this.buildCreditWarningMessage(status, total),
    };
  });

  private buildCreditWarningMessage(status: CreditStatusResponse, total: number): string {
    const parts: string[] = [];
    if (status.hasOverdue) parts.push('El cliente tiene facturas vencidas.');
    if (total > status.availableCredit) {
      const deficit = total - status.availableCredit;
      parts.push(`El total excede el crédito disponible por ${deficit.toLocaleString()}.`);
    }
    if (!status.canCreateCreditInvoice) parts.push('El cliente no puede crear facturas a crédito.');
    return parts.join(' ');
  }

  private readonly FIELD_LABELS: Record<string, string> = { customerId: 'Cliente', paymentType: 'Tipo de Pago' };

  readonly paymentTypeOptions = computed(() => {
    const options = Object.values(PaymentType).map((pt) => ({
      label: PAYMENT_TYPE_LABELS[pt],
      value: pt,
    }));
    const status = this.creditStatus();
    if (!status?.canCreateCreditInvoice) {
      return options.filter(o => o.value !== PaymentType.CREDIT);
    }
    return options;
  });

  readonly hasCreditEnabled = computed(() => {
    const status = this.creditStatus();
    return (status?.creditLimit ?? 0) > 0 && (status?.canCreateCreditInvoice ?? false);
  });

  readonly items = signal<OrderItemFormData[]>([]);

  readonly total = computed(() =>
    this.items().reduce((sum, i) => sum + i.quantity * i.unitPrice, 0),
  );

  readonly form = this.fb.group({
    customerId: ['', [Validators.required]],
    paymentType: [PaymentType.CASH, [Validators.required]],
    notes: [''],
  });

  ngOnInit(): void {
    this.form.statusChanges.subscribe(() => this.updateSubmitTooltip());
    this.updateSubmitTooltip();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.invoiceId.set(id);
      this.tabId = `invoices-edit-${id}`;
      this.loadInvoice(id);
    } else {
      const queryTabId = this.route.snapshot.queryParamMap.get('tabId');
      this.tabId = queryTabId || `invoices-create-${Date.now()}`;
      this.restoreFromPendingTab();
    }
    this.form.controls.notes.valueChanges.subscribe(() => this.scheduleAutoSave());
    this.form.controls.paymentType.valueChanges.subscribe((paymentType) => {
      const customerId = this.selectedCustomerId();
      if (customerId) {
        this.loadCreditStatus(customerId);
        if (paymentType === PaymentType.CASH) this.loadCustomerBalance(customerId);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.autoSaveTimer) clearTimeout(this.autoSaveTimer);
    if (this.form.dirty && !this.isSubmitted) this.savePendingTab();
  }

  private scheduleAutoSave(): void {
    if (this.isSubmitted) return;
    if (this.autoSaveTimer) clearTimeout(this.autoSaveTimer);
    this.autoSaveTimer = setTimeout(() => this.savePendingTab(), PENDING_TABS_CONFIG.DEBOUNCE_TIME);
  }

  private savePendingTab(): void {
    const label = this.selectedCustomerLabel();
    const formData: InvoiceFormData = {
      customerId: this.form.value.customerId ?? '',
      customerAlias: label?.alias ?? '',
      customerLegalName: label?.legalName ?? '',
      notes: this.form.value.notes ?? '',
      items: this.items(),
    };
    const title = this.invoiceNumber() ? `Editar Factura ${this.invoiceNumber()}` : this.isEditMode() ? 'Editar Factura' : 'Nueva Factura';
    const route = this.isEditMode() ? `/facturas/${this.invoiceId()}/edit` : `/facturas/new?tabId=${this.tabId}`;
    this.pendingTabsService.save(this.tabId, title, route, formData, this.isEditMode() ? 'edit' : 'create', 'invoices');
  }

  private restoreFromPendingTab(): void {
    const tab = this.pendingTabsService.get<InvoiceFormData>(this.tabId);
    if (!tab) return;
    this.form.patchValue({ customerId: tab.formData.customerId, notes: tab.formData.notes });
    this.items.set(tab.formData.items);
    if (tab.formData.customerId) {
      this.selectedCustomer.set({ id: tab.formData.customerId } as CustomerList);
      this.selectedCustomerLabel.set({ alias: tab.formData.customerAlias, legalName: tab.formData.customerLegalName });
    }
  }

  private markAsSubmitted(): void { this.isSubmitted = true; this.pendingTabsService.remove(this.tabId); }

  private updateSubmitTooltip(): void {
    const invalid = Object.entries(this.FIELD_LABELS).filter(([key]) => this.form.get(key)?.invalid).map(([, label]) => label);
    this.submitTooltip.set(invalid.length ? `Campos requeridos: ${invalid.join(', ')}` : '');
  }

  private loadInvoice(id: string): void {
    this.invoiceService.loadById(id).subscribe({
      next: (invoice) => {
        this.invoiceNumber.set(invoice.invoiceNumber ?? null);
        this.form.patchValue({ notes: invoice.notes ?? '', paymentType: invoice.paymentType });
        this.selectedCustomerLabel.set({ alias: invoice.customerName, legalName: invoice.customerName });
        this.form.patchValue({ customerId: invoice.customerId });
        this.selectedCustomer.set({ id: invoice.customerId } as CustomerList);
        this.items.set(invoice.lines.map((item) => ({
          productId: item.productId, productCode: item.productCode, productName: item.productName,
          quantity: item.quantity, unitPrice: item.unitPrice,
          stock: (item.warehouseStocks ?? []).map((s) => ({ warehouseId: s.warehouseId, warehouseCode: s.warehouseCode, warehouseName: s.warehouseName, quantity: s.quantity, reserved: s.reserved, available: s.available })),
          warehouseAllocations: item.warehouseAllocations.map((a) => ({ warehouseId: a.warehouseId, warehouseCode: a.warehouseCode, warehouseName: a.warehouseName, available: a.available, allocated: a.allocated })),
        })));
      },
    });
  }

  private loadCreditStatus(customerId: string): void {
    this.receivablesApi.getCreditStatus(customerId).subscribe({
      next: (status) => this.creditStatus.set(status),
      error: () => this.creditStatus.set(null),
    });
  }

  private loadCustomerBalance(customerId: string): void {
    this.balanceApi.getBalance(customerId).subscribe({
      next: (balance) => this.customerBalance.set(balance.totalBalance),
      error: () => this.customerBalance.set(0),
    });
  }

  openPicker(): void { this.pickerVisible.set(true); }

  onCustomerSelected(customer: CustomerList): void {
    this.selectedCustomer.set(customer);
    this.selectedCustomerLabel.set({ alias: customer.alias, legalName: customer.legalName });
    this.form.patchValue({ customerId: customer.id });
    this.items.set([]);
    this.pickerVisible.set(false);
    this.form.patchValue({ paymentType: PaymentType.CASH });
    this.scheduleAutoSave();
    this.loadCreditStatus(customer.id);
    this.loadCustomerBalance(customer.id);
  }

  onPickerCancelled(): void { this.pickerVisible.set(false); }
  onItemsChange(updated: OrderItemFormData[]): void { this.items.set(updated); this.scheduleAutoSave(); }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    if (this.items().length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Debes agregar al menos un producto.', life: 4000 });
      return;
    }
    if (this.items().filter((i) => i.warehouseAllocations.length === 0).length > 0) {
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Todos los productos deben tener asignación de almacén.', life: 5000 });
      return;
    }

    this.isSubmitting.set(true);
    const formValue = this.form.value;
    const baseData = {
      customerId: formValue.customerId ?? '',
      paymentType: formValue.paymentType as PaymentType,
      notes: formValue.notes ?? '',
      lines: this.items().map((i) => ({
        productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice,
        warehouseAllocations: i.warehouseAllocations.filter((a) => a.allocated > 0).map((a) => ({ warehouseId: a.warehouseId, allocated: a.allocated })),
      })),
    };

    if (this.isEditMode() && this.invoiceId()) {
      this.invoiceService.update(this.invoiceId()!, baseData).subscribe({
        next: (inv) => { this.isSubmitting.set(false); this.markAsSubmitted(); this.messageService.add(INVOICE_SUCCESS_MESSAGES.updated); this.router.navigate(['/invoices', inv.id]); },
        error: () => { this.isSubmitting.set(false); this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar.', life: 5000 }); },
      });
    } else {
      this.invoiceService.create(baseData).subscribe({
        next: (inv) => {
          this.isSubmitting.set(false);
          this.markAsSubmitted();
          this.messageService.add(INVOICE_SUCCESS_MESSAGES.created);
          this.router.navigate(['/invoices', inv.id]);
        },
        error: () => { this.isSubmitting.set(false); this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al crear.', life: 5000 }); },
      });
    }
  }

  cancel(): void { this.router.navigate(['/invoices']); }
}
