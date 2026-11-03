import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { Popover, PopoverModule } from 'primeng/popover';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { TranslateOptionsPipe } from '@core/i18n/translate-options.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { ShortcutDirective } from '@core/shortcuts/shortcut.directive';

export type ListFilterFieldType = 'select' | 'text' | 'number' | 'date';

export type ListFilterVariant = 'default' | 'compact';

export interface ListFilterOption {
  labelKey: string;
  value: string;
}

export interface ListFilterField {
  key: string;
  labelKey: string;
  type: ListFilterFieldType;
  value: string;
  placeholderKey?: string;
  options?: readonly ListFilterOption[];
}

export interface ListFilterChange {
  key: string;
  value: string;
}

@Component({
  selector: 'app-list-filter',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    DatePickerModule,
    InputTextModule,
    PopoverModule,
    SelectModule,
    TooltipModule,
    TranslateOptionsPipe,
    TranslatePipe,
    ShortcutDirective,
  ],
  templateUrl: './list-filter.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListFilterComponent {
  readonly fields = input<readonly ListFilterField[]>([]);
  readonly activeCount = input(0);
  readonly variant = input<ListFilterVariant>('default');
  readonly appendTo = input('body');
  readonly shortcut = input<'filter' | null>('filter');
  readonly tooltipKey = input('shared.filters');
  readonly titleKey = input('shared.filters');
  readonly clearLabelKey = input('finance.billing.creditnotes.clear');
  readonly testId = input<string | null>(null);
  readonly buttonClass = input('');
  readonly dateFormat = input('dd/mm/yy');

  readonly filterChange = output<ListFilterChange>();
  readonly cleared = output<void>();

  private readonly filterPopover = viewChild<Popover>('filterPopover');

  close(): void {
    this.filterPopover()?.hide();
  }

  readonly hasActiveFilters = computed(() => this.activeCount() > 0);
  readonly isCompact = computed(() => this.variant() === 'compact');

  changeField(field: ListFilterField, value: string): void {
    this.filterChange.emit({ key: field.key, value });
  }

  changeDate(field: ListFilterField, value: Date | null): void {
    this.filterChange.emit({ key: field.key, value: this.toDateValue(value) });
  }

  onTextChange(field: ListFilterField, value: string): void {
    this.filterChange.emit({ key: field.key, value });
  }

  fieldValue(field: ListFilterField): string {
    return field.value ?? '';
  }

  fieldOptions(field: ListFilterField): { label: string; value: string }[] {
    return (field.options ?? []).map((option) => ({
      label: option.labelKey,
      value: option.value,
    }));
  }

  fieldDate(field: ListFilterField): Date | null {
    if (!field.value) return null;
    const date = new Date(`${field.value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  private toDateValue(value: Date | null): string {
    if (!value) return '';
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
