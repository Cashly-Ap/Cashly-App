import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { MainLayoutComponent } from '@core/layouts/main-layout.component';
import { FormContainerComponent } from '@core/forms/components/cards/form-container/form-container.component';
import { FormHeaderComponent } from '@core/forms/components/headers/form-header/form-header.component';
import { FormCardComponent } from '@core/forms/components/cards/form-card/form-card.component';
import { FormActionsComponent } from '@core/forms/components/headers/form-actions/form-actions.component';
import { FinanceApplicationService } from '@features/finances/services/application/finance-application.service';
import { CustomerList } from '@features/customers/models/interfaces';
import { CustomerPickerDialogComponent } from '@features/orders/components/customer-picker-dialog/customer-picker-dialog.component';
import { InvoiceApiService } from '@features/invoices/services/api/invoice-api.service';
import { InvoiceList } from '@features/invoices/models/interfaces';
import { TextBadgeComponent } from '@shared/components/ui/text-badge/text-badge.component';

@Component({
  selector: 'app-debit-note-form-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    TextareaModule,
    InputNumberModule,
    InputTextModule,
    DialogModule,
    CommonModule,
    MainLayoutComponent,
    FormContainerComponent,
    FormHeaderComponent,
    FormCardComponent,
    FormActionsComponent,
    CustomerPickerDialogComponent,
    TextBadgeComponent,
  ],
  templateUrl: './debit-note-form-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DebitNoteFormPageComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly financeService = inject(FinanceApplicationService);
  private readonly messageService = inject(MessageService);
  private readonly invoiceApi = inject(InvoiceApiService);

  readonly isSubmitting = signal<boolean>(false);
  readonly selectedCustomer = signal<CustomerList | null>(null);
  readonly selectedCustomerLabel = signal<{ alias: string; legalName: string } | null>(null);
  readonly pickerVisible = signal<boolean>(false);

  readonly invoicePickerVisible = signal(false);
  readonly searchedInvoices = signal<InvoiceList[]>([]);
  readonly selectedInvoice = signal<InvoiceList | null>(null);
  readonly searchingInvoices = signal(false);
  readonly invoiceSearchTerm = signal('');

  private searchTimeout: ReturnType<typeof setTimeout> | null = null;

  readonly selectedCustomerId = computed(() => this.selectedCustomer()?.id ?? null);

  readonly submitTooltip = signal('');

  private readonly FIELD_LABELS: Record<string, string> = {
    customerId: 'Cliente',
    invoiceId: 'Factura',
    amount: 'Monto',
    reason: 'Motivo',
  };

  readonly form = this.fb.group({
    customerId: ['', [Validators.required]],
    invoiceId: ['', [Validators.required]],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    reason: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.form.statusChanges.subscribe(() => this.updateSubmitTooltip());
    this.updateSubmitTooltip();
  }

  private updateSubmitTooltip(): void {
    const invalid = Object.entries(this.FIELD_LABELS)
      .filter(([key]) => this.form.get(key)?.invalid)
      .map(([, label]) => label);
    this.submitTooltip.set(invalid.length ? `Campos requeridos: ${invalid.join(', ')}` : '');
  }

  openPicker(): void {
    this.pickerVisible.set(true);
  }

  onCustomerSelected(customer: CustomerList): void {
    this.selectedCustomer.set(customer);
    this.selectedCustomerLabel.set({ alias: customer.alias, legalName: customer.legalName });
    this.form.patchValue({ customerId: customer.id });
    this.pickerVisible.set(false);
  }

  onPickerCancelled(): void {
    this.pickerVisible.set(false);
  }

  openInvoicePicker(): void {
    this.invoicePickerVisible.set(true);
    this.searchInvoices({});
  }

  onInvoiceSearch(): void {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.searchInvoices({ search: this.invoiceSearchTerm() });
    }, 300);
  }

  searchInvoices(filters: { search?: string; customerId?: string; dateFrom?: string; dateTo?: string }): void {
    this.searchingInvoices.set(true);
    this.invoiceApi.getAll({
      search: filters.search,
      customerId: filters.customerId,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
    }).subscribe({
      next: (invoices) => this.searchedInvoices.set(invoices),
      error: () => this.searchedInvoices.set([]),
      complete: () => this.searchingInvoices.set(false),
    });
  }

  onInvoiceSelected(invoice: InvoiceList): void {
    this.selectedInvoice.set(invoice);
    this.form.patchValue({ invoiceId: invoice.id });
    if (!this.selectedCustomer()) {
      this.selectedCustomer.set({ id: invoice.customerId, alias: invoice.customerName, legalName: '' } as CustomerList);
      this.selectedCustomerLabel.set({ alias: invoice.customerName, legalName: '' });
      this.form.patchValue({ customerId: invoice.customerId });
    }
    this.invoicePickerVisible.set(false);
  }

  onInvoicePickerCancelled(): void {
    this.invoicePickerVisible.set(false);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    const formValue = this.form.value;

    this.financeService
      .createDebitNote({
        customerId: formValue.customerId ?? '',
        invoiceId: formValue.invoiceId ?? '',
        amount: formValue.amount ?? 0,
        reason: formValue.reason ?? '',
      })
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Nota de débito creada exitosamente',
            life: 3000,
          });
          this.router.navigate(['/debit-notes']);
        },
        error: () => {
          this.isSubmitting.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al crear la nota de débito',
            life: 5000,
          });
        },
      });
  }

  cancel(): void {
    this.router.navigate(['/debit-notes']);
  }
}
