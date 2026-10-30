import { LanguageService } from '@core/i18n/language.service';
import { TranslateOptionsPipe } from '@core/i18n/translate-options.pipe';
import { provideTranslatedMessages } from '@core/i18n/translated-feedback.service';
import { LocalizedDatePipe, LocalizedNumberPipe } from '@core/i18n/localized-format.pipe';
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
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageService } from 'primeng/api';
import { FormContainerComponent } from '@core/forms/components/cards/form-container/form-container.component';
import { FormHeaderComponent } from '@core/forms/components/headers/form-header/form-header.component';
import { FormCardComponent } from '@core/forms/components/cards/form-card/form-card.component';
import { FormActionsComponent } from '@core/forms/components/headers/form-actions/form-actions.component';
import { PendingTabsService } from '@core/pending-tabs';
import { PENDING_TABS_CONFIG } from '@core/pending-tabs/constants';
import { InvoiceApplicationService } from '@features/finance/billing/invoices/services/application/invoice-application.service';
import { OrderItemsTableComponent } from '@features/sales/orders/components/order-items-table/order-items-table.component';
import { OrderItemFormData } from '@features/sales/orders/models/interfaces/order-form-data.interface';
import { CustomerList } from '@features/partners/customers/models/interfaces/customer-list.interface';
import { CustomerPickerDialogComponent } from '@features/sales/orders/components/customer-picker-dialog/customer-picker-dialog.component';
import {
  PaymentType,
  PAYMENT_TYPE_LABELS,
} from '@features/finance/billing/invoices/models/enums/payment-type.enum';
import { InvoiceFormData } from '@features/finance/billing/invoices/models/interfaces/invoice-form-data.interface';
import { INVOICE_SUCCESS_MESSAGES } from '@features/finance/billing/invoices/messages/success-messages';
import { ReceivablesApiService } from '@features/finance/treasury/receivables/services/api/receivables-api.service';
import { CreditStatusResponse } from '@features/finance/treasury/receivables/models/interfaces/credit-status.interface';
import { CustomerBalanceApiService } from '@features/partners/customers/services/api/customer-balance-api.service';
import { CustomerApiService } from '@features/partners/customers/services/api/customer-api.service';
import { ToastModule } from 'primeng/toast';
import { forkJoin } from 'rxjs';
import {
  InvoiceSourcePickerDialogComponent,
  InvoiceSourceSelection,
} from '@features/finance/billing/invoices/components/invoice-source-picker-dialog/invoice-source-picker-dialog.component';
import { InvoiceCreate } from '@features/finance/billing/invoices/models/interfaces/invoice-create.interface';

@Component({
  selector: 'app-invoice-form-page',
  standalone: true,
  imports: [
    TranslateOptionsPipe,
    TranslatePipe,
    LocalizedDatePipe,
    LocalizedNumberPipe,
    ReactiveFormsModule,
    DecimalPipe,
    DatePipe,
    ButtonModule,
    TextareaModule,
    SelectModule,
    DatePickerModule,
    ToastModule,
    FormContainerComponent,
    FormHeaderComponent,
    FormCardComponent,
    FormActionsComponent,
    OrderItemsTableComponent,
    CustomerPickerDialogComponent,
    InvoiceSourcePickerDialogComponent,
  ],
  providers: [provideTranslatedMessages()],
  templateUrl: './invoice-form-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceFormPageComponent implements OnInit, OnDestroy {
  readonly locale = inject(LanguageService).locale;

  private readonly navigationHistory = inject(NavigationHistoryService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly invoiceService = inject(InvoiceApplicationService);
  private readonly messageService = inject(MessageService);
  private readonly pendingTabsService = inject(PendingTabsService);
  private readonly receivablesApi = inject(ReceivablesApiService);
  private readonly balanceApi = inject(CustomerBalanceApiService);
  private readonly customerApi = inject(CustomerApiService);

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
  readonly sourcePickerVisible = signal(false);
  readonly bulkMode = signal(false);
  readonly bulkCreationStarted = signal(false);
  readonly selectedCustomers = signal<CustomerList[]>([]);
  readonly sourceOrderIds = signal<string[]>([]);
  readonly sourceQuoteIds = signal<string[]>([]);
  readonly selectedCustomerId = computed(() => this.selectedCustomer()?.id ?? null);
  readonly selectedCustomerIds = computed(() =>
    this.selectedCustomers().map((customer) => customer.id),
  );
  readonly submitTooltip = signal('');

  readonly creditStatus = signal<CreditStatusResponse | null>(null);
  readonly creditStatusByCustomer = signal<Record<string, CreditStatusResponse>>({});
  readonly customerBalance = signal(0);
  readonly customerCreditDays = signal<number | null>(null);
  readonly creditDaysByCustomer = signal<Record<string, number>>({});
  readonly dueDate = signal<Date | null>(null);
  readonly dueDatesByCustomer = signal<Record<string, Date>>({});
  readonly isCreditPayment = signal(false);

  readonly creditInfo = computed(() => {
    const s = this.creditStatus();
    if (!s) return null;
    return {
      creditLimit: s.creditLimit,
      customerBalance: s.customerBalance,
      availableCredit: s.availableCredit,
    };
  });

  readonly creditWarningMessage = computed(() => {
    const status = this.creditStatus();
    const paymentType = this.form.get('paymentType')?.value;
    const total = this.total();
    if (!status || paymentType !== PaymentType.CREDIT) return null;
    if (status.availableCredit >= total && !status.hasOverdue && status.canCreateCreditInvoice)
      return null;
    return this.buildCreditWarning(status, total);
  });

  creditWarningForCustomer(customerId: string) {
    if (!this.isCreditPayment()) return null;
    const status = this.creditStatusByCustomer()[customerId];
    if (
      !status ||
      (status.availableCredit >= this.total() &&
        !status.hasOverdue &&
        status.canCreateCreditInvoice)
    ) {
      return null;
    }
    return this.buildCreditWarning(status, this.total());
  }

  private buildCreditWarning(status: CreditStatusResponse, total: number) {
    return {
      hasOverdue: status.hasOverdue,
      canCreateCreditInvoice: status.canCreateCreditInvoice,
      creditLimit: status.creditLimit,
      availableCredit: status.availableCredit,
      invoiceTotal: total,
      message: this.buildCreditWarningMessage(status, total),
    };
  }

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

  private readonly FIELD_LABELS: Record<string, string> = {
    customerId: 'Cliente',
    paymentType: 'Tipo de Pago',
  };

  readonly paymentTypeOptions = computed(() => {
    const options = Object.values(PaymentType).map((pt) => ({
      label: PAYMENT_TYPE_LABELS[pt],
      value: pt,
    }));
    const status = this.creditStatus();
    if (!status?.canCreateCreditInvoice) {
      return options.filter((o) => o.value !== PaymentType.CREDIT);
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
    issueDate: [new Date(), [Validators.required]],
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
    this.form.controls.issueDate.valueChanges.subscribe(() => {
      this.recalculateDueDate();
      this.recalculateAllCustomerDueDates();
      this.scheduleAutoSave();
    });
    this.form.controls.paymentType.valueChanges.subscribe((paymentType) => {
      this.isCreditPayment.set(paymentType === PaymentType.CREDIT);
      this.recalculateDueDate();
      this.recalculateAllCustomerDueDates();
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
      issueDate: this.toIsoDate(this.form.value.issueDate),
      items: this.items(),
      orderIds: this.sourceOrderIds(),
      quoteIds: this.sourceQuoteIds(),
    };
    const title = this.invoiceNumber()
      ? `Editar Factura ${this.invoiceNumber()}`
      : this.isEditMode()
        ? 'Editar Factura'
        : 'Nueva Factura';
    const route = this.isEditMode()
      ? `/facturas/${this.invoiceId()}/edit`
      : `/facturas/new?tabId=${this.tabId}`;
    this.pendingTabsService.save(
      this.tabId,
      title,
      route,
      formData,
      this.isEditMode() ? 'edit' : 'create',
      'invoices',
    );
  }

  private restoreFromPendingTab(): void {
    const tab = this.pendingTabsService.get<InvoiceFormData>(this.tabId);
    if (!tab) return;
    this.form.patchValue({
      customerId: tab.formData.customerId,
      notes: tab.formData.notes,
      issueDate: tab.formData.issueDate ? this.fromIsoDate(tab.formData.issueDate) : new Date(),
    });
    this.items.set(tab.formData.items);
    this.sourceOrderIds.set(tab.formData.orderIds ?? []);
    this.sourceQuoteIds.set(tab.formData.quoteIds ?? []);
    if (tab.formData.customerId) {
      this.selectedCustomer.set({ id: tab.formData.customerId } as CustomerList);
      this.selectedCustomerLabel.set({
        alias: tab.formData.customerAlias,
        legalName: tab.formData.customerLegalName,
      });
      this.loadCustomerDetails(tab.formData.customerId);
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

  private loadInvoice(id: string): void {
    this.invoiceService.loadById(id).subscribe({
      next: (invoice) => {
        this.invoiceNumber.set(invoice.invoiceNumber ?? null);
        this.form.patchValue({
          notes: invoice.notes ?? '',
          paymentType: invoice.paymentType,
          issueDate: invoice.issueDate ? this.fromIsoDate(invoice.issueDate) : new Date(),
        });
        this.isCreditPayment.set(invoice.paymentType === PaymentType.CREDIT);
        this.selectedCustomerLabel.set({
          alias: invoice.customerName,
          legalName: invoice.customerName,
        });
        this.form.patchValue({ customerId: invoice.customerId });
        this.selectedCustomer.set({ id: invoice.customerId } as CustomerList);
        this.dueDate.set(invoice.dueDate ? this.fromIsoDate(invoice.dueDate) : null);
        this.loadCustomerDetails(invoice.customerId);
        this.items.set(
          invoice.lines.map((item) => ({
            productId: item.productId,
            productCode: item.productCode,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            stock: (item.warehouseStocks ?? []).map((s) => ({
              warehouseId: s.warehouseId,
              warehouseCode: s.warehouseCode,
              warehouseName: s.warehouseName,
              quantity: s.quantity,
              reserved: s.reserved,
              available: s.available,
            })),
            warehouseAllocations: item.warehouseAllocations.map((a) => ({
              warehouseId: a.warehouseId,
              warehouseCode: a.warehouseCode,
              warehouseName: a.warehouseName,
              available: a.available,
              allocated: a.allocated,
            })),
          })),
        );
      },
      error: () => this.router.navigate(['/finance/billing/invoices']),
    });
  }

  private loadCreditStatus(customerId: string): void {
    this.receivablesApi.getCreditStatus(customerId).subscribe({
      next: (status) => {
        this.creditStatus.set(status);
        this.creditStatusByCustomer.update((current) => ({ ...current, [customerId]: status }));
      },
      error: () => {
        this.creditStatus.set(null);
        this.creditStatusByCustomer.update((current) => {
          const next = { ...current };
          delete next[customerId];
          return next;
        });
      },
    });
  }

  private loadCreditStatusForBulk(customers: CustomerList[]): void {
    forkJoin(
      customers.map((customer) => this.receivablesApi.getCreditStatus(customer.id)),
    ).subscribe({
      next: (statuses) => {
        const statusByCustomer = statuses.reduce<Record<string, CreditStatusResponse>>(
          (result, status) => {
            result[status.customerId] = status;
            return result;
          },
          {},
        );
        this.creditStatusByCustomer.set(statusByCustomer);
        this.creditStatus.set(statusByCustomer[customers[0].id] ?? null);
      },
      error: () => {
        this.creditStatusByCustomer.set({});
        this.creditStatus.set(null);
      },
    });
  }

  private loadCustomerBalance(customerId: string): void {
    this.balanceApi.getBalance(customerId).subscribe({
      next: (balance) => this.customerBalance.set(balance.totalBalance),
      error: () => this.customerBalance.set(0),
    });
  }

  private loadCustomerDetails(customerId: string): void {
    this.customerApi.getById(customerId).subscribe({
      next: (customer) => {
        this.customerCreditDays.set(customer.creditDays ?? 0);
        this.creditDaysByCustomer.update((current) => ({
          ...current,
          [customerId]: customer.creditDays ?? 0,
        }));
        this.recalculateDueDate();
        this.setCustomerDueDate(customerId, customer.creditDays ?? 0);
      },
      error: () => {
        this.customerCreditDays.set(null);
        this.creditDaysByCustomer.update((current) => {
          const next = { ...current };
          delete next[customerId];
          return next;
        });
        this.dueDate.set(null);
        this.removeCustomerDueDate(customerId);
      },
    });
  }

  private loadCustomerDetailsForBulk(customers: CustomerList[]): void {
    forkJoin(customers.map((customer) => this.customerApi.getById(customer.id))).subscribe({
      next: (details) => {
        const creditDaysByCustomer = details.reduce<Record<string, number>>((result, customer) => {
          result[customer.id] = customer.creditDays ?? 0;
          return result;
        }, {});
        this.creditDaysByCustomer.set(creditDaysByCustomer);
        this.recalculateAllCustomerDueDates();
      },
      error: () => {
        this.creditDaysByCustomer.set({});
        this.dueDatesByCustomer.set({});
      },
    });
  }

  private setCustomerDueDate(customerId: string, creditDays: number): void {
    this.dueDatesByCustomer.update((current) => ({
      ...current,
      [customerId]: this.calculateDueDate(creditDays),
    }));
  }

  private removeCustomerDueDate(customerId: string): void {
    this.dueDatesByCustomer.update((current) => {
      const next = { ...current };
      delete next[customerId];
      return next;
    });
  }

  private recalculateAllCustomerDueDates(): void {
    const creditDaysByCustomer = this.creditDaysByCustomer();
    this.dueDatesByCustomer.update(() =>
      Object.entries(creditDaysByCustomer).reduce<Record<string, Date>>(
        (result, [customerId, creditDays]) => {
          result[customerId] = this.calculateDueDate(creditDays);
          return result;
        },
        {},
      ),
    );
  }

  private calculateDueDate(creditDays: number): Date {
    const issueDate = this.form.controls.issueDate.value;
    const dueDate = issueDate instanceof Date ? new Date(issueDate) : new Date();
    dueDate.setDate(dueDate.getDate() + creditDays);
    return dueDate;
  }

  dueDateForCustomer(customerId: string): Date | null {
    return this.dueDatesByCustomer()[customerId] ?? null;
  }

  private recalculateDueDate(): void {
    const issueDate = this.form.controls.issueDate.value;
    const creditDays = this.customerCreditDays();
    if (!(issueDate instanceof Date) || Number.isNaN(issueDate.getTime()) || creditDays === null) {
      this.dueDate.set(null);
      return;
    }

    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + creditDays);
    this.dueDate.set(dueDate);
  }

  openPicker(): void {
    this.pickerVisible.set(true);
  }

  toggleBulkMode(): void {
    if (this.isEditMode()) return;
    this.resetInvoiceForCustomerChange();
    this.bulkMode.update((value) => !value);
    this.pickerVisible.set(true);
  }

  openSourcePicker(): void {
    if (this.selectedCustomerId() && !this.bulkMode() && !this.isEditMode()) {
      this.sourcePickerVisible.set(true);
    }
  }

  onCustomerSelected(customer: CustomerList): void {
    this.resetInvoiceForCustomerChange(false);
    this.selectedCustomer.set(customer);
    this.selectedCustomerLabel.set({ alias: customer.alias, legalName: customer.legalName });
    this.form.patchValue({ customerId: customer.id });
    this.pickerVisible.set(false);
    this.form.patchValue({ paymentType: PaymentType.CASH });
    this.scheduleAutoSave();
    this.loadCreditStatus(customer.id);
    this.loadCustomerBalance(customer.id);
    this.loadCustomerDetails(customer.id);
  }

  onCustomersSelected(customers: CustomerList[]): void {
    if (customers.length === 0) return;
    this.resetInvoiceForCustomerChange(false);
    this.selectedCustomers.set(customers);
    const primary = customers[0];
    this.selectedCustomer.set(primary);
    this.selectedCustomerLabel.set({ alias: primary.alias, legalName: primary.legalName });
    this.form.patchValue({ customerId: primary.id });
    this.pickerVisible.set(false);
    this.form.patchValue({ paymentType: PaymentType.CASH });
    this.scheduleAutoSave();
    this.loadCustomerBalance(primary.id);
    this.loadCreditStatusForBulk(customers);
    this.loadCustomerDetailsForBulk(customers);
  }

  onPickerCancelled(): void {
    this.pickerVisible.set(false);
  }

  private resetInvoiceForCustomerChange(notify = true): void {
    const hadInvoiceData =
      this.items().length > 0 ||
      this.sourceOrderIds().length > 0 ||
      this.sourceQuoteIds().length > 0 ||
      this.selectedCustomer() !== null ||
      this.selectedCustomers().length > 0;

    this.items.set([]);
    this.sourceOrderIds.set([]);
    this.sourceQuoteIds.set([]);
    this.selectedCustomers.set([]);
    this.selectedCustomer.set(null);
    this.selectedCustomerLabel.set(null);
    this.creditStatus.set(null);
    this.creditStatusByCustomer.set({});
    this.customerBalance.set(0);
    this.customerCreditDays.set(null);
    this.creditDaysByCustomer.set({});
    this.dueDate.set(null);
    this.dueDatesByCustomer.set({});
    this.isCreditPayment.set(false);
    this.form.reset({
      customerId: '',
      paymentType: PaymentType.CASH,
      notes: '',
      issueDate: this.form.controls.issueDate.value ?? new Date(),
    });

    if (notify && hadInvoiceData) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Factura reiniciada',
        detail:
          'Al cambiar entre factura individual y varios clientes se han eliminado el cliente, las líneas y los documentos cargados.',
        life: 5000,
      });
    }
  }

  onSourcesSelected(selection: InvoiceSourceSelection): void {
    this.sourceOrderIds.update((ids) => [...new Set([...ids, ...selection.orderIds])]);
    this.sourceQuoteIds.update((ids) => [...new Set([...ids, ...selection.quoteIds])]);
    this.items.update((items) => [...items, ...selection.items]);
    this.sourcePickerVisible.set(false);
    this.scheduleAutoSave();
  }

  private hasInvalidSourceAllocation(): boolean {
    if (this.sourceOrderIds().length === 0 && this.sourceQuoteIds().length === 0) return false;
    return this.items().some((item) => {
      const allocated = item.warehouseAllocations.reduce(
        (sum, allocation) => sum + allocation.allocated,
        0,
      );
      return Math.abs(allocated - item.quantity) > 0.0001;
    });
  }

  private hasInsufficientBulkStock(): boolean {
    const customerCount = this.selectedCustomers().length;
    if (!this.bulkMode() || customerCount < 2) return false;

    return this.items().some((item) => {
      const required = item.quantity * customerCount;
      const available = item.stock.reduce((sum, stock) => sum + stock.available, 0);
      if (available < required) return true;

      return item.warehouseAllocations.some((allocation) => {
        const stock = item.stock.find((entry) => entry.warehouseId === allocation.warehouseId);
        const availableInWarehouse = stock?.available ?? allocation.available;
        return allocation.allocated * customerCount > availableInWarehouse;
      });
    });
  }

  onSourcePickerCancelled(): void {
    this.sourcePickerVisible.set(false);
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
        detail: 'Debes agregar al menos un producto.',
        life: 4000,
      });
      return;
    }
    if (this.hasInvalidSourceAllocation()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Stock insuficiente',
        detail:
          'Revisa la distribución por almacén: no hay stock suficiente para cubrir todos los productos cargados.',
        life: 5000,
      });
      return;
    }
    if (this.hasInsufficientBulkStock()) {
      const customerCount = this.selectedCustomers().length;
      this.messageService.add({
        severity: 'warn',
        summary: 'Stock insuficiente',
        detail: `La cantidad de cada producto se multiplica por los ${customerCount} clientes. Revisa el stock total y la distribución por almacén antes de crear las facturas.`,
        life: 6000,
      });
      return;
    }
    if (this.items().filter((i) => i.warehouseAllocations.length === 0).length > 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Todos los productos deben tener asignación de almacén.',
        life: 5000,
      });
      return;
    }

    this.isSubmitting.set(true);
    const formValue = this.form.value;
    const baseData: InvoiceCreate = {
      customerId: formValue.customerId ?? '',
      orderIds: this.sourceOrderIds(),
      quoteIds: this.sourceQuoteIds(),
      paymentType: formValue.paymentType as PaymentType,
      issueDate: this.toIsoDate(formValue.issueDate),
      notes: formValue.notes ?? '',
      lines: this.items().map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        warehouseAllocations: i.warehouseAllocations
          .filter((a) => a.allocated > 0)
          .map((a) => ({ warehouseId: a.warehouseId, allocated: a.allocated })),
      })),
    };

    if (this.bulkMode() && !this.isEditMode()) {
      const customers = this.selectedCustomers();
      if (customers.length < 2) {
        this.isSubmitting.set(false);
        this.messageService.add({
          severity: 'warn',
          summary: 'Advertencia',
          detail: 'Selecciona al menos dos clientes.',
          life: 4000,
        });
        return;
      }
      this.bulkCreationStarted.set(true);
      forkJoin(
        customers.map((customer) =>
          this.invoiceService.create({
            ...baseData,
            customerId: customer.id,
            orderIds: [],
            quoteIds: [],
          }),
        ),
      ).subscribe({
        next: (invoices) => {
          this.isSubmitting.set(false);
          this.markAsSubmitted();
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: `Se crearon ${customers.length} facturas.`,
            life: 4000,
          });
          this.router.navigate(['/finance/billing/invoices', invoices[0].id]);
        },
        error: () => {
          this.isSubmitting.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron crear todas las facturas.',
            life: 5000,
          });
        },
      });
    } else if (this.isEditMode() && this.invoiceId()) {
      this.invoiceService
        .update(this.invoiceId()!, {
          paymentType: baseData.paymentType,
          issueDate: baseData.issueDate,
          notes: baseData.notes ?? null,
          lines: baseData.lines,
        })
        .subscribe({
          next: (inv) => {
            this.isSubmitting.set(false);
            this.markAsSubmitted();
            this.messageService.add(INVOICE_SUCCESS_MESSAGES.updated);
            this.router.navigate(['/finance/billing/invoices', inv.id]);
          },
          error: () => {
            this.isSubmitting.set(false);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al actualizar.',
              life: 5000,
            });
          },
        });
    } else {
      this.invoiceService.create(baseData).subscribe({
        next: (inv) => {
          this.isSubmitting.set(false);
          this.markAsSubmitted();
          this.messageService.add(INVOICE_SUCCESS_MESSAGES.created);
          this.router.navigate(['/finance/billing/invoices', inv.id]);
        },
        error: () => {
          this.isSubmitting.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al crear.',
            life: 5000,
          });
        },
      });
    }
  }

  cancel(): void {
    this.navigationHistory.back(['/finance/billing/invoices']);
  }

  private toIsoDate(value: Date | string | null | undefined): string {
    if (!value) return new Date().toISOString().slice(0, 10);
    if (typeof value === 'string') return value;
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private fromIsoDate(value: string): Date {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
}
