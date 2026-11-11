import { LocalizedNumberPipe } from '@core/i18n/localized-format.pipe';
import { TranslateOptionsPipe } from '@core/i18n/translate-options.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { provideTranslatedMessages } from '@core/i18n/translated-feedback.service';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MessageService } from 'primeng/api';
import { ReturnApiService } from '@features/finance/billing/returns/services/api/return-api.service';
import { InvoiceDetails } from '@features/finance/billing/invoices/models/interfaces/invoice-details.interface';
import { ReturnType } from '@features/finance/billing/returns/models/enums/return-type.enum';
import { WarehouseApiService } from '@features/inventory/warehouses/services/api/warehouse-api.service';
import { SingleWarehouseResolverService } from '@features/inventory/warehouses/services/application/single-warehouse-resolver.service';
import { SingleWarehouseContext } from '@features/inventory/warehouses/models/interfaces/single-warehouse.interface';
import { ReturnLinesTableComponent } from '@features/finance/billing/returns/components/return-lines-table/return-lines-table.component';

interface InvoiceLineFormData {
  invoiceLineId: string;
  productId: string;
  productName: string;
  quantity: number;
  warehouseId: string;
  unitPrice: number;
  warehouseAllocations: { warehouseId: string; allocated: number }[];
}

import { CancelButtonComponent } from '@shared/components/ui/cancel-button/cancel-button.component';
import { SubmitButtonComponent } from '@shared/components/ui/submit-button/submit-button.component';
import { DataTableComponent } from '@shared/components/ui/data-table/data-table.component';

@Component({
  selector: 'app-return-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DataTableComponent,
    SubmitButtonComponent,
    CancelButtonComponent,
    LocalizedNumberPipe,
    TranslateOptionsPipe,
    TranslatePipe,
    CommonModule,
    FormsModule,
    ButtonModule,
    TextareaModule,
    SelectModule,
    DialogModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    ReturnLinesTableComponent,
  ],
  providers: [provideTranslatedMessages()],
  templateUrl: './return-form-dialog.component.html',
})
export class ReturnFormDialogComponent implements OnInit {
  private readonly returnApi = inject(ReturnApiService);
  private readonly warehouseApi = inject(WarehouseApiService);
  private readonly singleWarehouseResolver = inject(SingleWarehouseResolverService);
  private readonly messageService = inject(MessageService);

  readonly visible = input<boolean>(false);
  readonly invoice = input.required<InvoiceDetails>();

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  readonly ReturnType = ReturnType;

  readonly isSubmitting = signal(false);
  readonly returnLines = signal<InvoiceLineFormData[]>([]);
  readonly warehouses = signal<{ id: string; name: string }[]>([]);
  readonly singleWarehouse = signal<SingleWarehouseContext | null>(null);

  readonly selectedReturnType = signal<ReturnType>(ReturnType.MANUAL);
  readonly reason = signal('');
  readonly autoWarehouseId = signal('');
  private prevVisible = false;

  readonly warehouseOptions = computed(() =>
    this.warehouses().map((w) => ({ label: w.name, value: w.id })),
  );

  readonly totalAmount = computed(() =>
    this.returnLines().reduce((sum, l) => sum + l.quantity * l.unitPrice, 0),
  );

  readonly returnTypeOptions = [
    { label: 'Manual', value: ReturnType.MANUAL },
    { label: 'Automática', value: ReturnType.AUTOMATIC },
  ];

  readonly canSubmit = computed(() => {
    if (!this.reason().trim()) return false;
    const lines = this.returnLines();
    if (lines.length === 0 || lines.some((l) => l.quantity <= 0)) return false;
    if (this.selectedReturnType() === ReturnType.AUTOMATIC && !this.autoWarehouseId()) return false;
    return true;
  });

  ngOnInit(): void {
    this.warehouseApi.getAllSimple().subscribe({
      next: (whs) => this.warehouses.set(whs.map((w) => ({ id: w.id, name: w.name }))),
    });
  }

  onVisibleChange(visible: boolean): void {
    if (visible && !this.prevVisible) {
      this.initLines();
    }
    this.prevVisible = visible;
    if (!visible) {
      this.onCancel();
    }
  }

  private initLines(): void {
    this.resolveSingleWarehouse(this.invoice().customerId);
    this.returnLines.set(
      this.invoice().lines.map((l) => ({
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

  onLinesChange(lines: InvoiceLineFormData[]): void {
    this.returnLines.set(lines);
  }

  onAutoWarehouseSelected(warehouseId: string): void {
    this.autoWarehouseId.set(warehouseId);
    if (!warehouseId) {
      this.returnLines.set([]);
      return;
    }

    const inv = this.invoice();
    this.returnLines.set(
      inv.lines
        .filter((l) => l.quantity - l.returnedQuantity > 0)
        .map((l) => {
          const remaining = l.quantity - l.returnedQuantity;
          return {
            invoiceLineId: l.id,
            productId: l.productId,
            productName: l.productName,
            quantity: remaining,
            warehouseId,
            unitPrice: l.unitPrice,
            warehouseAllocations: [{ warehouseId, allocated: remaining }],
          };
        }),
    );
  }

  submit(): void {
    if (!this.canSubmit()) return;

    this.isSubmitting.set(true);

    this.returnApi
      .create({
        customerId: this.invoice().customerId,
        invoiceId: this.invoice().id,
        returnType: this.selectedReturnType(),
        reason: this.reason().trim(),
        lines: this.returnLines().map((l) => ({
          invoiceLineId: l.invoiceLineId,
          productId: l.productId,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          subtotal: l.quantity * l.unitPrice,
          allocations: l.warehouseAllocations.map((a) => ({
            warehouseId: a.warehouseId,
            allocated: a.allocated,
          })),
        })),
      })
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Devolución creada exitosamente',
            life: 3000,
          });
          this.confirmed.emit();
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

  onCancel(): void {
    this.reason.set('');
    this.selectedReturnType.set(ReturnType.MANUAL);
    this.autoWarehouseId.set('');
    this.returnLines.set([]);
    this.cancelled.emit();
  }

  private resolveSingleWarehouse(customerId: string): void {
    this.singleWarehouseResolver.resolveForCustomer(customerId).subscribe({
      next: (warehouse) => this.singleWarehouse.set(warehouse),
      error: () => this.singleWarehouse.set(null),
    });
  }
}
