import { Component, inject, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormArray, FormGroup, Validators } from '@angular/forms';
import { MainLayoutComponent } from '@core/layouts/main-layout.component';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TabsModule } from 'primeng/tabs';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import {
  DetailsCardComponent,
  DetailsCardHeaderComponent,
  DetailsInfoFieldComponent,
  DetailsInfoGridComponent,
} from '@shared/components/details';
import { LoadingSpinnerComponent } from '@shared/components/ui/loading-spinner/loading-spinner.component';
import { PageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';
import { WarehouseApplicationService } from '@features/warehouses/services/application';
import { ProductApplicationService } from '@features/products/services/application';
import { WarehouseDetails } from '@features/warehouses/models/interfaces';

@Component({
  selector: 'app-warehouses-details-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MainLayoutComponent,
    ButtonModule,
    DialogModule,
    TabsModule,
    SelectModule,
    InputNumberModule,
    InputTextModule,
    DetailsCardComponent,
    DetailsCardHeaderComponent,
    DetailsInfoFieldComponent,
    DetailsInfoGridComponent,
    LoadingSpinnerComponent,
    PageHeaderComponent,
  ],
  templateUrl: './warehouses-details-page.component.html',
  providers: [MessageService],
})
export class WarehousesDetailsPageComponent implements OnInit {
  private service = inject(WarehouseApplicationService);
  private productService = inject(ProductApplicationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);

  warehouse = signal<WarehouseDetails | null>(null);
  loading = signal(false);
  showStockDialog = signal(false);
  stockLoading = signal(false);

  productOptions = computed(() =>
    this.productService.simpleProducts().map((p) => ({ value: p.id, label: p.name }))
  );

  stockForm: FormGroup = this.fb.group({
    lines: this.fb.array([this.createLineGroup()]),
  });

  get linesArray(): FormArray {
    return this.stockForm.get('lines') as FormArray;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadWarehouse(id);
      this.productService.loadSimpleProducts().subscribe();
    }
  }

  private loadWarehouse(id: string): void {
    this.loading.set(true);
    this.service.loadById(id).subscribe({
      next: (warehouse) => {
        this.warehouse.set(warehouse);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el almacén.', life: 5000 });
        this.router.navigate(['/warehouses']);
      },
    });
  }

  private createLineGroup(): FormGroup {
    return this.fb.group({
      productId: [null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(0.01)]],
      notes: [''],
    });
  }

  addLine(): void {
    this.linesArray.push(this.createLineGroup());
  }

  removeLine(index: number): void {
    this.linesArray.removeAt(index);
  }

  openStockDialog(): void {
    while (this.linesArray.length > 1) this.linesArray.removeAt(1);
    this.linesArray.at(0).reset({ productId: null, quantity: 1, notes: '' });
    this.showStockDialog.set(true);
  }

  onSubmitStock(): void {
    if (this.stockForm.invalid) {
      this.stockForm.markAllAsTouched();
      return;
    }

    const warehouseId = this.warehouse()?.id;
    if (!warehouseId) return;

    const lines = (this.stockForm.getRawValue().lines as { productId: string; quantity: number; notes: string }[])
      .map((l) => ({ productId: l.productId, quantity: l.quantity, notes: l.notes || undefined }));

    this.stockLoading.set(true);
    this.service.addStock(warehouseId, { lines }).subscribe({
      next: (updated) => {
        this.warehouse.set(updated);
        this.showStockDialog.set(false);
        this.stockLoading.set(false);
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Stock registrado exitosamente', life: 3000 });
      },
      error: () => {
        this.stockLoading.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al registrar el stock.', life: 5000 });
      },
    });
  }

  onEdit(): void {
    const id = this.warehouse()?.id;
    if (id) this.router.navigate(['/warehouses', id, 'edit']);
  }

  onToggleActive(): void {
    const w = this.warehouse();
    if (!w) return;
    this.service.toggleActive(w.id, !w.active).subscribe({
      next: (updated) => {
        this.warehouse.set(updated);
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: `Almacén ${updated.active ? 'activado' : 'desactivado'} exitosamente`, life: 3000 });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cambiar el estado.', life: 5000 });
      },
    });
  }

  onBack(): void {
    this.router.navigate(['/warehouses']);
  }

  getMovementTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      ENTRY: 'Entrada',
      EXIT: 'Salida',
      ADJUSTMENT: 'Ajuste',
    };
    return labels[type] ?? type;
  }

  getMovementTypeClass(type: string): string {
    const classes: Record<string, string> = {
      ENTRY: 'px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      EXIT: 'px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      ADJUSTMENT: 'px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    };
    return classes[type] ?? 'px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800';
  }
}
