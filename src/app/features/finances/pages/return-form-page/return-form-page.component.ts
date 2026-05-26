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
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MessageService } from 'primeng/api';
import { MainLayoutComponent } from '@core/layouts/main-layout.component';
import { FormContainerComponent } from '@core/forms/components/cards/form-container/form-container.component';
import { FormHeaderComponent } from '@core/forms/components/headers/form-header/form-header.component';
import { FormCardComponent } from '@core/forms/components/cards/form-card/form-card.component';
import { FormActionsComponent } from '@core/forms/components/headers/form-actions/form-actions.component';
import { FinanceApplicationService } from '@features/finances/services/application/finance-application.service';
import { InvoiceApiService } from '@features/invoices/services/api/invoice-api.service';
import { ReturnType, RETURN_TYPE_LABELS } from '@features/finances/models/enums/return-type.enum';
import { ReturnLinesTableComponent } from '@features/finances/components/return-lines-table/return-lines-table.component';
import { InvoicePickerDialogComponent } from '@features/finances/components/invoice-picker-dialog/invoice-picker-dialog.component';
import { InvoiceDetails, InvoiceList } from '@features/invoices/models/interfaces';
import { WarehouseApiService } from '@features/warehouses/services/api/warehouse-api.service';

interface InvoiceLineFormData {
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
    DialogModule,
    TableModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    MainLayoutComponent,
    FormContainerComponent,
    FormHeaderComponent,
    FormCardComponent,
    FormActionsComponent,
    ReturnLinesTableComponent,
    InvoicePickerDialogComponent,
  ],
  templateUrl: './return-form-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReturnFormPageComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly financeService = inject(FinanceApplicationService);
  private readonly invoiceApi = inject(InvoiceApiService);
  private readonly warehouseApi = inject(WarehouseApiService);
  private readonly messageService = inject(MessageService);

  readonly isSubmitting = signal<boolean>(false);
  readonly selectedInvoice = signal<InvoiceDetails | null>(null);
  readonly showInvoicePicker = signal(false);

  readonly returnType = signal<ReturnType>(ReturnType.MANUAL);

  readonly returnTypeOptions = Object.values(ReturnType).map((t) => ({
    label: RETURN_TYPE_LABELS[t],
    value: t,
  }));

  readonly warehouses = signal<{ id: string; name: string }[]>([]);
  readonly autoWarehouseId = signal<string>('');

  readonly returnLines = signal<InvoiceLineFormData[]>([]);

  readonly warehouseOptions = computed(() =>
    this.warehouses().map((w) => ({ label: w.name, value: w.id })),
  );

  readonly totalAmount = computed(() =>
    this.returnLines().reduce((sum, l) => sum + l.quantity * l.unitPrice, 0),
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

  onInvoiceSelected(invoice: InvoiceList): void {
    this.showInvoicePicker.set(false);
    this.form.patchValue({ invoiceId: invoice.id });
    this.invoiceApi.getById(invoice.id).subscribe({
      next: (inv) => {
        this.selectedInvoice.set(inv);
        this.form.patchValue({ customerId: inv.customerId });
        this.resetLines();
      },
    });
  }

  onLinesChange(lines: InvoiceLineFormData[]): void {
    this.returnLines.set(lines);
  }

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

    const invalidLines = lines.filter((l) => l.quantity <= 0);
    if (invalidLines.length > 0) {
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
    this.financeService
      .createReturn({
        invoiceId: formValue.invoiceId ?? '',
        customerId: formValue.customerId ?? '',
        returnType: formValue.returnType as ReturnType,
        reason: formValue.reason ?? '',
        lines: lines.map((l) => ({
          invoiceLineId: l.invoiceLineId,
          productId: l.productId,
          quantity: l.quantity,
          warehouseId: l.warehouseId,
          unitPrice: l.unitPrice,
        })),
      })
      .subscribe({
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
