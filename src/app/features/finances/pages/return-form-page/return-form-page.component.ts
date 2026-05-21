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
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
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
import { ReturnWarehouseSelectorComponent } from '@features/finances/components/return-warehouse-selector/return-warehouse-selector.component';
import { InvoiceDetails } from '@features/invoices/models/interfaces';

interface InvoiceLineFormData {
  invoiceLineId: string;
  productId: string;
  productName: string;
  quantity: number;
  warehouseId: string;
  unitPrice: number;
}

@Component({
  selector: 'app-return-form-page',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    ReactiveFormsModule,
    ButtonModule,
    TextareaModule,
    SelectModule,
    MainLayoutComponent,
    FormContainerComponent,
    FormHeaderComponent,
    FormCardComponent,
    FormActionsComponent,
    ReturnLinesTableComponent,
    ReturnWarehouseSelectorComponent,
  ],
  templateUrl: './return-form-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReturnFormPageComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly financeService = inject(FinanceApplicationService);
  private readonly invoiceApi = inject(InvoiceApiService);
  private readonly messageService = inject(MessageService);

  readonly isSubmitting = signal<boolean>(false);
  readonly selectedInvoice = signal<InvoiceDetails | null>(null);
  readonly selectedInvoiceLabel = signal<string | null>(null);
  readonly returnType = signal<ReturnType>(ReturnType.MANUAL);
  readonly selectedWarehouseId = signal<string>('');

  readonly returnTypeOptions = Object.values(ReturnType).map((t) => ({
    label: RETURN_TYPE_LABELS[t],
    value: t,
  }));

  readonly returnLines = signal<InvoiceLineFormData[]>([]);

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
    this.form.controls.returnType.valueChanges.subscribe((type) => {
      if (type) {
        this.returnType.set(type as ReturnType);
        if (this.selectedInvoice()) {
          this.resetLines();
        }
      }
    });
  }

  onInvoiceSelected(invoice: InvoiceDetails): void {
    this.selectedInvoice.set(invoice);
    this.selectedInvoiceLabel.set(`#${invoice.invoiceNumber} - ${invoice.customerName}`);
    this.form.patchValue({ invoiceId: invoice.id, customerId: invoice.customerId });
    this.resetLines();
  }

  onLinesChange(lines: InvoiceLineFormData[]): void {
    this.returnLines.set(lines);
  }

  onWarehouseChange(warehouseId: string): void {
    this.selectedWarehouseId.set(warehouseId);
    if (this.returnType() === ReturnType.AUTOMATIC && this.selectedInvoice()) {
      this.autoFillLines(warehouseId);
    }
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

    const invalidLines = lines.filter((l) => l.quantity <= 0 || !l.warehouseId);
    if (invalidLines.length > 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Todas las líneas deben tener cantidad mayor a 0 y un almacén asignado.',
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
          this.router.navigate(['/finanzas/devoluciones', ret.id]);
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
    this.router.navigate(['/finanzas/devoluciones']);
  }

  private resetLines(): void {
    const invoice = this.selectedInvoice();
    if (!invoice) {
      this.returnLines.set([]);
      return;
    }

    if (this.returnType() === ReturnType.AUTOMATIC) {
      this.returnLines.set([]);
    } else {
      this.returnLines.set(
        invoice.lines.map((l) => ({
          invoiceLineId: l.id,
          productId: l.productId,
          productName: l.productName,
          quantity: 0,
          warehouseId: '',
          unitPrice: l.unitPrice,
        })),
      );
    }
  }

  private autoFillLines(warehouseId: string): void {
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
      })),
    );
  }
}
