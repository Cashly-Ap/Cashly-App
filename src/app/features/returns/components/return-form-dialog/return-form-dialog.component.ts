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
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MessageService } from 'primeng/api';
import { ReturnApiService } from '@features/returns/services/api/return-api.service';
import { InvoiceDetails } from '@features/invoices/models/interfaces';
import { ReturnType } from '@features/returns/models/enums/return-type.enum';
import { WarehouseApiService } from '@features/warehouses/services/api/warehouse-api.service';
import { ReturnLinesTableComponent } from '@features/returns/components/return-lines-table/return-lines-table.component';
import { ToastModule } from 'primeng/toast';

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
  selector: 'app-return-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    DecimalPipe,
    FormsModule,
    ButtonModule,
    TextareaModule,
    SelectModule,
    DialogModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    ToastModule,
    ReturnLinesTableComponent,
  ],
  providers: [MessageService],
  template: `
    <p-toast position="top-right" />

    <p-dialog
      [header]="'Crear Devolución — #' + invoice().invoiceNumber"
      [modal]="true"
      [visible]="visible()"
      [style]="{ width: 'min(90vw, 960px)' }"
      [draggable]="false"
      [resizable]="false"
      (onShow)="onVisibleChange(true)"
      (onHide)="onVisibleChange(false)"
    >
      <div class="flex flex-col gap-4 py-2">
        <!-- Customer -->
        <div class="rounded-xl p-3 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700">
          <p class="text-sm text-surface-600 dark:text-surface-400">
            <span class="font-semibold text-surface-800 dark:text-surface-200">Cliente:</span>
            {{ invoice().customerName }} — {{ invoice().customerRif }}
          </p>
        </div>

        <!-- Type -->
        <div class="rounded-xl p-3 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700">
          <label class="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Tipo de Devolución *</label>
          <p-select
            [options]="returnTypeOptions"
            [ngModel]="selectedReturnType()"
            (ngModelChange)="selectedReturnType.set($event)"
            optionLabel="label"
            optionValue="value"
            styleClass="w-full"
            appendTo="body"
          />
        </div>

        <!-- Reason -->
        <div class="rounded-xl p-3 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700">
          <label class="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Motivo *</label>
          <textarea
            pTextarea
            [ngModel]="reason()"
            (ngModelChange)="reason.set($event)"
            rows="3"
            class="w-full"
            placeholder="Motivo de la devolución..."
          ></textarea>
        </div>

        <!-- Líneas -->
        @if (selectedReturnType() === ReturnType.MANUAL) {
          <app-return-lines-table
            [invoiceLines]="invoice().lines"
            [returnLines]="returnLines()"
            (returnLinesChange)="onLinesChange($event)"
          />
        } @else {
          <div class="rounded-xl p-3 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700">
            <label class="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Almacén de destino *</label>
            <p-select
              [options]="warehouseOptions()"
              [ngModel]="autoWarehouseId()"
              (ngModelChange)="onAutoWarehouseSelected($event)"
              optionLabel="label"
              optionValue="value"
              placeholder="Seleccionar almacén..."
              styleClass="w-full"
              appendTo="body"
            />
            <p class="text-xs text-surface-400 dark:text-surface-500 mt-1.5">
              Al seleccionar el almacén se cargarán todas las líneas con la cantidad máxima de la factura.
            </p>

            @if (returnLines().length > 0) {
              <div class="overflow-x-auto mt-4">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-surface-200 dark:border-surface-700">
                      <th class="text-left py-2 font-semibold">Producto</th>
                      <th class="text-right py-2 font-semibold">Cantidad</th>
                      <th class="text-right py-2 font-semibold">Precio Unit.</th>
                      <th class="text-right py-2 font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (line of returnLines(); track line.invoiceLineId) {
                      <tr class="border-b border-surface-100 dark:border-surface-800">
                        <td class="py-2">{{ line.productName }}</td>
                        <td class="text-right py-2">{{ line.quantity }}</td>
                        <td class="text-right py-2">{{ line.unitPrice | number: '1.2-2' }}</td>
                        <td class="text-right py-2 font-medium">{{ (line.quantity * line.unitPrice) | number: '1.2-2' }}</td>
                      </tr>
                    }
                  </tbody>
                  <tfoot>
                    <tr class="border-t border-surface-200 dark:border-surface-700">
                      <td colspan="3" class="text-right py-3 font-semibold">Total:</td>
                      <td class="text-right py-3 font-bold">{{ totalAmount() | number: '1.2-2' }}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            }
          </div>
        }
      </div>

      <ng-template pTemplate="footer">
        <div class="flex gap-2 justify-end">
          <p-button label="Cancelar" [outlined]="true" severity="secondary" (onClick)="onCancel()" />
          <p-button
            label="Guardar Devolución"
            icon="pi pi-check"
            severity="contrast"
            [loading]="isSubmitting()"
            [disabled]="!canSubmit()"
            (onClick)="submit()"
          />
        </div>
      </ng-template>
    </p-dialog>
  `,
})
export class ReturnFormDialogComponent implements OnInit {
  private readonly returnApi = inject(ReturnApiService);
  private readonly warehouseApi = inject(WarehouseApiService);
  private readonly messageService = inject(MessageService);

  readonly visible = input<boolean>(false);
  readonly invoice = input.required<InvoiceDetails>();

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  readonly ReturnType = ReturnType;

  readonly isSubmitting = signal(false);
  readonly returnLines = signal<InvoiceLineFormData[]>([]);
  readonly warehouses = signal<{ id: string; name: string }[]>([]);

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
}
