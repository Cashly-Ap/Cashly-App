import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';

interface WarehouseOption {
  id: string;
  code: string;
  name: string;
}

@Component({
  selector: 'app-return-warehouse-selector',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, SelectModule],
  templateUrl: './return-warehouse-selector.component.html',
})
export class ReturnWarehouseSelectorComponent implements OnInit {
  readonly selectedWarehouseId = input.required<string>();
  readonly warehouseChange = output<string>();

  readonly warehouses = signal<WarehouseOption[]>([
    { id: 'wh-1', code: 'MAIN', name: 'Almacén Principal' },
    { id: 'wh-2', code: 'SEC', name: 'Almacén Secundario' },
  ]);

  readonly warehouseOptions = signal<{ label: string; value: string }[]>([]);

  ngOnInit(): void {
    this.warehouseOptions.set(
      this.warehouses().map((w) => ({
        label: `${w.name} (${w.code})`,
        value: w.id,
      })),
    );
  }

  onChange(value: string): void {
    this.warehouseChange.emit(value);
  }
}
