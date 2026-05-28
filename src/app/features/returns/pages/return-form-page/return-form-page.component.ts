import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { MainLayoutComponent } from '@core/layouts/main-layout.component';
import { FormContainerComponent } from '@core/forms/components/cards/form-container/form-container.component';
import { FormHeaderComponent } from '@core/forms/components/headers/form-header/form-header.component';
import { FormCardComponent } from '@core/forms/components/cards/form-card/form-card.component';
import { FormActionsComponent } from '@core/forms/components/headers/form-actions/form-actions.component';
import { CustomerPickerDialogComponent } from '@features/orders/components/customer-picker-dialog/customer-picker-dialog.component';
import { InvoicePickerDialogComponent } from '@shared/ui/invoice-picker-dialog';
import { ReturnApplicationService } from '../../services/application/return-application.service';
import { InvoiceApiService } from '@features/invoices/services/api/invoice-api.service';
import { WarehouseApiService } from '@features/warehouses/services/api/warehouse-api.service';
import { ReturnType, RETURN_TYPE_LABELS } from '../../models/enums/return-type.enum';
import { ReturnCreate } from '../../models/interfaces';
import { CustomerList } from '@features/customers/models/interfaces';
import { InvoiceList, InvoiceDetails, InvoiceLineDetail } from '@features/invoices/models/interfaces';
import { ReturnLinesTableComponent } from '@features/returns/components/return-lines-table/return-lines-table.component';

interface ReturnLineFormData {
  invoiceLineId: string;
  productId: string;
  productName: string;
  quantity: number;
  warehouseId: string;
  unitPrice: number;
  warehouseAllocations: { warehouseId: string; allocated: number }[];
}

@Component({
  selector: 'app-return-form-page',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    TextareaModule,
    SelectModule,
    MainLayoutComponent,
    FormContainerComponent,
    FormHeaderComponent,
    FormCardComponent,
    FormActionsComponent,
    CustomerPickerDialogComponent,
    InvoicePickerDialogComponent,
    ReturnLinesTableComponent,
  ],
  templateUrl: './return-form-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReturnFormPageComponent implements OnInit {
  // Expose enum for template access
  readonly ReturnType = ReturnType;

  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ReturnApplicationService);
  private readonly invoiceApi = inject(InvoiceApiService);
  private readonly warehouseApi = inject(WarehouseApiService);
  private readonly messageService = inject(MessageService);

  readonly isSubmitting = signal<boolean>(false);

  // Customer picker
  readonly showCustomerPicker = signal(false);
  readonly selectedCustomer = signal<CustomerList | null>(null);
  readonly selectedCustomerLabel = signal<{ alias: string; legalName: string } | null>(null);

  // Invoice picker
  readonly showInvoicePicker = signal(false);
  readonly selectedInvoice = signal<InvoiceDetails | null>(null);

  // Return type
  readonly returnType = signal<ReturnType>(ReturnType.MANUAL);
  readonly returnTypeOptions = Object.values(ReturnType).map((t) => ({
    label: RETURN_TYPE_LABELS[t],
    value: t,
  }));

  // Warehouses for auto allocation
  readonly warehouses = signal<{ id: string; name: string }[]>([]);
  readonly autoWarehouseId = signal<string>('');
  readonly warehouseOptions = computed(() =>
    this.warehouses().map((w) => ({ label: w.name, value: w.id })),
  );

  // Return lines
  readonly returnLines = signal<ReturnLineFormData[]>([]);
  readonly totalAmount = computed(() =>
    this.returnLines().reduce((sum, l) => sum + l.quantity * l.unitPrice, 0),
  );
  readonly hasInvalidLines = computed(() =>
    this.returnLines().some((l) => l.quantity <= 0),
  );

  readonly form = this.fb.group({
    invoiceId: ['', [Validators.required]],
    customerId: ['', [Validators.required]],
    returnType: [ReturnType.MANUAL, [Validators.required]],
    reason: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.warehouseApi.getAllSimple().subscribe({
      next: (whs) => this.warehouses.set(whs.map((w) => ({ id: w.id, name: w.name }))),
    });

    this.form.controls.returnType.valueChanges.subscribe((type) => {
      if (type) {
        this.returnType.set(type as ReturnType);
        this.autoWarehouseId.set('');
        if (this.selectedInvoice()) {
          this.resetLines();
        }
      }
    });
  }

  // Customer picker
  openCustomerPicker(): void {
    this.showCustomerPicker.set(true);
  }

  onCustomerSelected(customer: CustomerList): void {
    this.selectedCustomer.set(customer);
    this.selectedCustomerLabel.set({ alias: customer.alias, legalName: customer.legalName });
    this.form.patchValue({ customerId: customer.id });
    this.showCustomerPicker.set(false);
    // Reset selected invoice when customer changes
    this.selectedInvoice.set(null);
    this.form.patchValue({ invoiceId: '' });
    this.returnLines.set([]);
  }

  onCustomerPickerCancelled(): void {
    this.showCustomerPicker.set(false);
  }

  // Invoice picker
  openInvoicePicker(): void {
    if (!this.selectedCustomer()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Debes seleccionar un cliente primero.',
        life: 3000,
      });
      return;
    }
    this.showInvoicePicker.set(true);
  }

  onInvoiceSelected(invoice: InvoiceList): void {
    this.showInvoicePicker.set(false);
    this.form.patchValue({ invoiceId: invoice.id });
    if (!this.selectedCustomer()) {
      this.selectedCustomer.set({ id: invoice.customerId, alias: invoice.customerName, legalName: '' } as CustomerList);
      this.selectedCustomerLabel.set({ alias: invoice.customerName, legalName: '' });
      this.form.patchValue({ customerId: invoice.customerId });
    }
    this.invoiceApi.getById(invoice.id).subscribe({
      next: (inv) => {
        this.selectedInvoice.set(inv);
        this.resetLines();
      },
    });
  }

  onInvoicePickerCancelled(): void {
    this.showInvoicePicker.set(false);
  }

  // Auto warehouse allocation
  onAutoWarehouseSelected(warehouseId: string): void {
    this.autoWarehouseId.set(warehouseId);
    if (!warehouseId) return;

    const invoice = this.selectedInvoice();
    if (!invoice) return;

    this.returnLines.set(
      invoice.lines.map((l) => ({
        invoiceLineId: l.id,
        productId: l.productId,
        productName: l.productName,
        quantity: l.quantity,
        warehouseId,
        unitPrice: l.unitPrice,
        warehouseAllocations: [{ warehouseId, allocated: l.quantity }],
      })),
    );
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const lines = this.returnLines();
    if (lines.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Debes agregar al menos una línea a la devolución.',
        life: 4000,
      });
      return;
    }

    if (this.returnType() === ReturnType.AUTOMATIC && !this.autoWarehouseId()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Debes seleccionar un almacén para la devolución automática.',
        life: 4000,
      });
      return;
    }

    if (this.hasInvalidLines()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Todas las líneas deben tener cantidad mayor a 0.',
        life: 5000,
      });
      return;
    }

    this.isSubmitting.set(true);

    const formValue = this.form.value;
    const payload: ReturnCreate = {
      invoiceId: formValue.invoiceId ?? '',
      customerId: formValue.customerId ?? '',
      returnType: formValue.returnType as ReturnType,
      reason: formValue.reason ?? '',
      lines: lines.map((l) => ({
        invoiceLineId: l.invoiceLineId,
        productId: l.productId,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        allocations: l.warehouseAllocations.map((a) => ({
          warehouseId: a.warehouseId,
          allocated: a.allocated,
        })),
      })),
    };

    this.service.createReturn(payload).subscribe({
      next: (ret) => {
        this.isSubmitting.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Devolución creada exitosamente',
          life: 3000,
        });
        this.router.navigate(['/returns', ret.id]);
      },
      error: () => {
        this.isSubmitting.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al crear la devolución. Por favor, intente nuevamente.',
          life: 5000,
        });
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/returns']);
  }

  private resetLines(): void {
    const invoice = this.selectedInvoice();
    if (!invoice) {
      this.returnLines.set([]);
      return;
    }

    this.returnLines.set(
      invoice.lines.map((l) => ({
        invoiceLineId: l.id,
        productId: l.productId,
        productName: l.productName,
        quantity: 0,
        warehouseId: '',
        unitPrice: l.unitPrice,
        warehouseAllocations: [],
      })),
    );
  }
}
