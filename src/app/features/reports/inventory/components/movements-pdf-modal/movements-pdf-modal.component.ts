import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { WarehouseApplicationService } from '@features/warehouses/services/application';
import { MovementsPdfFilters } from '@features/reports/inventory/models/interfaces';

@Component({
  selector: 'app-movements-pdf-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    SelectModule,
    DatePickerModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './movements-pdf-modal.component.html',
})
export class MovementsPdfModalComponent {
  private readonly warehouseService = inject(WarehouseApplicationService);

  readonly visible = input(false);
  readonly visibleChange = output<boolean>();
  readonly onGeneratePdf = output<MovementsPdfFilters>();
  readonly onGenerateExcel = output<MovementsPdfFilters>();

  readonly warehouseId = signal<string | null>(null);
  readonly movementType = signal<string | null>(null);
  readonly from = signal<Date | null>(null);
  readonly to = signal<Date | null>(null);
  readonly loading = signal(false);

  readonly movementTypeOptions = [
    { value: null, label: 'Todos los tipos' },
    { value: 'ENTRY', label: 'Entrada' },
    { value: 'EXIT', label: 'Salida' },
    { value: 'ADJUSTMENT', label: 'Ajuste' },
    { value: 'TRANSFER_IN', label: 'Transferencia Entrada' },
    { value: 'TRANSFER_OUT', label: 'Transferencia Salida' },
    { value: 'COMPONENT_EXIT', label: 'Salida Componente' },
  ];

  readonly warehouseOptions = computed(() => [
    { value: null, label: 'Todos los almacenes' },
    ...this.warehouseService
      .simpleWarehouses()
      .map((w) => ({ value: w.id, label: `${w.name} (${w.state})` })),
  ]);

  loadFilters(): void {
    if (this.warehouseService.simpleWarehouses().length > 0) return;
    this.loading.set(true);
    this.warehouseService.loadSimpleWarehouses().subscribe(() => this.loading.set(false));
  }

  private buildFilters(): MovementsPdfFilters {
    return {
      warehouseId: this.warehouseId() ?? undefined,
      movementType: this.movementType() ?? undefined,
      from: this.from() ? formatDate(this.from()!) : undefined,
      to: this.to() ? formatDate(this.to()!) : undefined,
    };
  }

  generatePdf(): void {
    this.onGeneratePdf.emit(this.buildFilters());
  }

  generateExcel(): void {
    this.onGenerateExcel.emit(this.buildFilters());
  }
}

function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
