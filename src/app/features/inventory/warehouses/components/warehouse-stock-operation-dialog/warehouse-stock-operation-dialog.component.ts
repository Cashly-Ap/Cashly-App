import { LocalizedCurrencyPipe, LocalizedNumberPipe } from '@core/i18n/localized-format.pipe';
import { LanguageService } from '@core/i18n/language.service';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import {
  ChangeDetectionStrategy,
  Component,
  OnChanges,
  SimpleChanges,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';

import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, catchError, map, of } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { ProductDetails } from '@features/catalog/products/models/interfaces/product-details.interface';
import { ProductList } from '@features/catalog/products/models/interfaces/product-list.interface';
import { ProductApplicationService } from '@features/catalog/products/services/application/product-application.service';
import { ProductApiService } from '@features/catalog/products/services/api/product-api.service';
import { WarehouseStockItem } from '@features/inventory/warehouses/models/interfaces/warehouse.interfaces';
import { WAREHOUSE_ERROR_MESSAGES } from '@features/inventory/warehouses/messages/error-messages';
import { WAREHOUSE_SUCCESS_MESSAGES } from '@features/inventory/warehouses/messages/success-messages';
import { WarehouseApplicationService } from '@features/inventory/warehouses/services/application/warehouse-application.service';
import {
  StockOverviewApiService,
  StockOverviewItem,
  StockOverviewResponse,
} from '@features/inventory/warehouses/services/api/stock-overview-api.service';
import { ProductPickerDialogComponent } from '@shared/components/product-picker-dialog/product-picker-dialog.component';
import {
  ProductPickerFilters,
  ProductPickerItem,
  ProductPickerPage,
  ProductPickerSelection,
} from '@shared/components/product-picker-dialog/product-picker.models';

export type WarehouseStockOperation = 'entry' | 'exit';

import { CancelButtonComponent } from '@shared/components/ui/cancel-button/cancel-button.component';
@Component({
  selector: 'app-warehouse-stock-operation-dialog',
  standalone: true,
  imports: [
    CancelButtonComponent,
    TranslatePipe,
    LocalizedCurrencyPipe,
    LocalizedNumberPipe,
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    InputNumberModule,
    InputTextModule,
    ProductPickerDialogComponent,
  ],
  templateUrl: './warehouse-stock-operation-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WarehouseStockOperationDialogComponent implements OnChanges {
  readonly locale = inject(LanguageService).locale;
  private readonly warehouseService = inject(WarehouseApplicationService);
  private readonly productService = inject(ProductApplicationService);
  private readonly productApi = inject(ProductApiService);
  private readonly stockOverviewApi = inject(StockOverviewApiService);
  private readonly messageService = inject(MessageService);
  private readonly formBuilder = inject(FormBuilder);

  readonly warehouseId = input<string | null>(null);
  readonly warehouseName = input('');
  readonly operation = input<WarehouseStockOperation>('entry');
  readonly visible = model(false);
  readonly completed = output<void>();

  readonly submitting = signal(false);
  readonly stockLoading = signal(false);
  readonly pickerVisible = signal(false);
  readonly pickerLineIndex = signal(0);
  readonly excludedProductIds = signal<Set<string>>(new Set());
  readonly pickedProductLabels = signal<Map<string, string>>(new Map());
  readonly stock = signal<WarehouseStockItem[]>([]);
  readonly form = this.formBuilder.group({ lines: this.formBuilder.array([this.createLine()]) });
  readonly loadPickerProducts = (filters: ProductPickerFilters): Observable<ProductPickerPage> =>
    this.operation() === 'exit'
      ? this.loadStockPickerProducts(filters)
      : this.loadCatalogPickerProducts(filters);

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

  addLine(): FormGroup {
    const line = this.createLine();
    this.lines.push(line);
    return line;
  }

  removeLine(index: number): void {
    if (this.lines.length > 1) this.lines.removeAt(index);
  }

  onProductSelected(productId: string | null): void {
    if (!productId || this.compositeDetails().has(productId)) return;
    this.productService.getById(productId).subscribe({
      next: (details) => {
        if (!details.components?.length) return;
        this.compositeDetails.update((current) => new Map(current).set(productId, details));
      },
      error: () => {},
    });
  }

  openProductPicker(index: number): void {
    const selected = new Set<string>();
    this.lines.controls.forEach((line, lineIndex) => {
      if (lineIndex === index) return;
      const productId = line.get('productId')?.value;
      if (productId) selected.add(productId);
    });
    this.excludedProductIds.set(selected);
    this.pickerLineIndex.set(index);
    this.pickerVisible.set(true);
  }

  onProductsPicked(selections: ProductPickerSelection[]): void {
    if (!selections.length) {
      this.pickerVisible.set(false);
      return;
    }

    selections.forEach((selection, index) => {
      const line = index === 0 ? this.targetLine() : this.nextAvailableLine();
      line.patchValue({ productId: selection.product.id });
      if (this.operation() === 'entry' && !line.get('unitPrice')?.value) {
        line.patchValue({ unitPrice: selection.unitPrice || null });
      }
      this.pickedProductLabels.update((labels) =>
        new Map(labels).set(selection.product.id, selection.product.name),
      );
      this.onProductSelected(selection.product.id);
    });

    this.pickerVisible.set(false);
  }

  private targetLine(): FormGroup {
    const line = this.lines.at(this.pickerLineIndex()) as FormGroup | null;
    return line ?? this.nextAvailableLine();
  }

  private nextAvailableLine(): FormGroup {
    const empty = this.lines.controls.find((line) => !line.get('productId')?.value) as
      | FormGroup
      | undefined;
    return empty ?? this.addLine();
  }

  productLabel(productId: string | null): string {
    if (!productId) return '';
    return (
      this.pickedProductLabels().get(productId) ??
      this.stock().find((item) => item.productId === productId)?.productName ??
      ''
    );
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
    this.pickedProductLabels.set(new Map());
    this.pickerVisible.set(false);
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

  private loadCatalogPickerProducts(filters: ProductPickerFilters): Observable<ProductPickerPage> {
    const stockByProduct = new Map(this.stock().map((item) => [item.productId, item.quantity]));
    return this.productApi
      .getAll({
        search: filters.search,
        categoryId: filters.categoryId,
        composite: filters.composite,
        active: true,
        page: filters.page,
        size: filters.size,
      })
      .pipe(
        map((response) => ({
          content: response.content.map((product) =>
            this.toCatalogPickerItem(product, stockByProduct.get(product.id) ?? 0),
          ),
          totalElements: response.totalElements,
          totalPages: response.totalPages,
          number: response.number,
        })),
      );
  }

  private loadStockPickerProducts(filters: ProductPickerFilters): Observable<ProductPickerPage> {
    const warehouseId = this.warehouseId();
    if (!warehouseId) {
      return of({ content: [], totalElements: 0, totalPages: 0, number: 0 });
    }
    return this.stockOverviewApi
      .getOverview({
        groupBy: 'NONE',
        warehouseId,
        search: filters.search,
        categoryId: filters.categoryId,
        page: filters.page,
        size: filters.size,
      })
      .pipe(
        map((response: StockOverviewResponse) => {
          const page = response.stock;
          if (!page) {
            return { content: [], totalElements: 0, totalPages: 0, number: 0 };
          }
          return {
            content: page.content.map((item) => this.toStockPickerItem(item)),
            totalElements: page.totalElements,
            totalPages: page.totalPages,
            number: page.number,
          };
        }),
      );
  }

  private toCatalogPickerItem(product: ProductList, totalStock: number): ProductPickerItem {
    return {
      id: product.id,
      code: product.code,
      name: product.name,
      categoryName: product.categoryName ?? '',
      active: product.active,
      composite: product.composite,
      price: product.purchasePrice ?? product.productPrices?.[0]?.price ?? 0,
      totalStock,
      stockItems: [],
    };
  }

  private toStockPickerItem(item: StockOverviewItem): ProductPickerItem {
    return {
      id: item.productId,
      code: item.productCode,
      name: item.productName,
      categoryName: item.categoryName ?? '',
      active: true,
      composite: item.composite,
      price: 0,
      totalStock: item.quantity,
      stockItems: [],
    };
  }

  private createLine(): FormGroup {
    return this.formBuilder.group({
      productId: [null as string | null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(0.001)]],
      unitPrice: [null as number | null],
      notes: [''],
    });
  }
}
