import {
  ChangeDetectionStrategy,
  Component,
  OnChanges,
  SimpleChanges,
  computed,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { ProductDetails } from '@features/catalog/products/models/interfaces/product-details.interface';
import { ProductApplicationService } from '@features/catalog/products/services/application/product-application.service';
import { WarehouseStockItem } from '@features/inventory/warehouses/models/interfaces/warehouse.interfaces';
import { WAREHOUSE_ERROR_MESSAGES } from '@features/inventory/warehouses/messages/error-messages';
import { WAREHOUSE_SUCCESS_MESSAGES } from '@features/inventory/warehouses/messages/success-messages';
import { WarehouseApplicationService } from '@features/inventory/warehouses/services/application/warehouse-application.service';

export type WarehouseStockOperation = 'entry' | 'exit';

@Component({
  selector: 'app-warehouse-stock-operation-dialog',
  standalone: true,
  imports: [
    CurrencyPipe,
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    InputNumberModule,
    InputTextModule,
    SelectModule,
  ],
  templateUrl: './warehouse-stock-operation-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WarehouseStockOperationDialogComponent implements OnChanges {
  private readonly warehouseService = inject(WarehouseApplicationService);
  private readonly productService = inject(ProductApplicationService);
  private readonly messageService = inject(MessageService);
  private readonly formBuilder = inject(FormBuilder);

  readonly warehouseId = input<string | null>(null);
  readonly warehouseName = input('');
  readonly operation = input<WarehouseStockOperation>('entry');
  readonly visible = model(false);
  readonly completed = output<void>();

  readonly submitting = signal(false);
  readonly stockLoading = signal(false);
  readonly stock = signal<WarehouseStockItem[]>([]);
  readonly form = this.formBuilder.group({ lines: this.formBuilder.array([this.createLine()]) });
  readonly productOptions = computed(() => {
    const availableStock = new Map(this.stock().map((item) => [item.productId, item.quantity]));
    return this.productService
      .simpleProducts()
      .filter(
        (product) => this.operation() === 'entry' || (availableStock.get(product.id) ?? 0) > 0,
      )
      .map((product) => ({
        value: product.id,
        label: product.composite ? `${product.name} [Compuesto]` : product.name,
      }));
  });

  readonly compositeDetails = signal(new Map<string, ProductDetails>());

  get lines(): FormArray {
    return this.form.controls.lines;
  }

  get title(): string {
    return this.operation() === 'entry'
      ? 'Registrar Entrada de Stock'
      : 'Registrar Salida de Stock';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue) this.initialize();
  }

  addLine(): void {
    this.lines.push(this.createLine());
  }

  removeLine(index: number): void {
    if (this.lines.length > 1) this.lines.removeAt(index);
  }

  onProductSelected(productId: string | null): void {
    if (!productId || this.compositeDetails().has(productId)) return;
    const product = this.productService.simpleProducts().find((item) => item.id === productId);
    if (!product?.composite) return;
    this.productService.getById(productId).subscribe({
      next: (details) =>
        this.compositeDetails.update((current) => new Map(current).set(productId, details)),
    });
  }

  compositeComponents(productId: string | null): ProductDetails['components'] {
    return productId ? (this.compositeDetails().get(productId)?.components ?? []) : [];
  }

  currentStock(productId: string | null): number {
    return this.stock().find((item) => item.productId === productId)?.quantity ?? 0;
  }

  resultingStock(productId: string | null, quantity: number | null): number {
    const current = this.currentStock(productId);
    const amount = quantity ?? 0;
    return this.operation() === 'entry' ? current + amount : current - amount;
  }

  entrySubtotal(index: number): number {
    const line = this.lines.at(index);
    return (line.get('quantity')?.value ?? 0) * (line.get('unitPrice')?.value ?? 0);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const warehouseId = this.warehouseId();
    if (!warehouseId) return;
    const values = this.form.getRawValue().lines;
    const items = values.map((line) => ({
      productId: line['productId']!,
      quantity: line['quantity']!,
      ...(this.operation() === 'entry' && line['unitPrice']
        ? { unitPrice: line['unitPrice'] }
        : {}),
      ...(line['notes'] ? { notes: line['notes'] } : {}),
    }));
    const request =
      this.operation() === 'entry'
        ? this.warehouseService.addEntry(warehouseId, { items })
        : this.warehouseService.addExit(warehouseId, { items });

    this.submitting.set(true);
    request.subscribe({
      next: () => {
        this.submitting.set(false);
        this.visible.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail:
            this.operation() === 'entry'
              ? WAREHOUSE_SUCCESS_MESSAGES.registerEntry
              : WAREHOUSE_SUCCESS_MESSAGES.registerExit,
          life: 3000,
        });
        this.completed.emit();
      },
      error: () => {
        this.submitting.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail:
            this.operation() === 'entry'
              ? WAREHOUSE_ERROR_MESSAGES.registerEntry
              : WAREHOUSE_ERROR_MESSAGES.registerExit,
          life: 5000,
        });
      },
    });
  }

  private initialize(): void {
    this.form.setControl('lines', this.formBuilder.array([this.createLine()]));
    this.stock.set([]);
    this.compositeDetails.set(new Map());
    this.productService.loadSimpleProducts().subscribe();
    const warehouseId = this.warehouseId();
    if (!warehouseId) return;
    this.stockLoading.set(true);
    this.warehouseService
      .getStock(warehouseId)
      .pipe(catchError(() => of([])))
      .subscribe((stock) => {
        this.stock.set(stock);
        this.stockLoading.set(false);
      });
  }

  private createLine(): FormGroup {
    return this.formBuilder.group({
      productId: [null as string | null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(0.01)]],
      unitPrice: [null as number | null],
      notes: [''],
    });
  }
}
