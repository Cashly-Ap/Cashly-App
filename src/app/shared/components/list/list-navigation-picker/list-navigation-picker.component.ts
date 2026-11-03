import { TranslateOptionsPipe } from '@core/i18n/translate-options.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { TranslationService } from '@core/i18n/translation.service';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { PopoverModule } from 'primeng/popover';
import { SearchFieldComponent } from '@shared/components/ui/search-field/search-field.component';
import {
  ListNavigationService,
  ListNavigationSession,
  NavigationRecord,
} from '../list-navigation.service';

import { ListFilterComponent } from '@shared/components/list/list-filter/list-filter.component';
import { CancelButtonComponent } from '@shared/components/ui/cancel-button/cancel-button.component';
import { TableCardComponent } from '@shared/components/ui/table-card/table-card.component';
import { DialogHeaderComponent } from '@shared/components/ui/dialog-header/dialog-header.component';
@Component({
  selector: 'app-list-navigation-picker',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DialogHeaderComponent,
    TableCardComponent,
    CancelButtonComponent,
    ListFilterComponent,
    TranslateOptionsPipe,
    TranslatePipe,
    FormsModule,
    SelectModule,
    DialogModule,
    ButtonModule,
    PopoverModule,
    SearchFieldComponent,
  ],
  templateUrl: './list-navigation-picker.component.html',
})
export class ListNavigationPickerComponent {
  readonly navigation = inject(ListNavigationService);
  private readonly translations = inject(TranslationService);
  readonly search = signal('');
  readonly accepting = signal(false);
  private readonly selection = signal<{
    session: ListNavigationSession;
    record: NavigationRecord;
  } | null>(null);
  readonly selectedRecord = computed(() => {
    const selected = this.selection();
    const session = this.navigation.session();
    if (
      !selected ||
      !session ||
      selected.session !== session ||
      !session.records().includes(selected.record) ||
      !this.navigation.available(selected.record)
    )
      return null;
    return selected.record;
  });

  constructor() {
    effect(() => {
      if (this.selection() && !this.selectedRecord()) this.selection.set(null);
    });
  }

  selectRecord(record: NavigationRecord): void {
    const session = this.navigation.session();
    if (!session || !session.records().includes(record) || !this.navigation.available(record))
      return;
    this.selection.set({ session, record });
  }

  isSelected(record: NavigationRecord): boolean {
    return this.selectedRecord() === record;
  }

  displayDescription(description: string): string {
    const statusKeys: Record<string, string> = {
      DRAFT: 'navigation.options.draft',
      CONFIRMED: 'navigation.options.confirmed',
      CANCELLED: 'navigation.options.cancelled',
      INVOICED: 'navigation.options.invoiced',
      CONVERTED_TO_ORDER: 'navigation.options.convertedToOrder',
      CONVERTED_TO_INVOICE: 'navigation.options.convertedToInvoice',
      PENDING_PAYMENT: 'navigation.options.pendingPayment',
      PARTIALLY_PAID: 'navigation.options.partiallyPaid',
      PAID: 'navigation.options.paid',
      FULLY_RETURNED: 'navigation.options.fullyReturned',
    };
    return description
      .split(' · ')
      .map((part) =>
        statusKeys[part] ? this.translations.t(statusKeys[part]) : this.translations.t(part),
      )
      .join(' · ');
  }

  async acceptSelection(): Promise<void> {
    const record = this.selectedRecord();
    if (!record || this.accepting()) return;
    this.accepting.set(true);
    try {
      await this.navigation.select(record);
    } finally {
      this.accepting.set(false);
    }
  }

  onDialogShow(): void {
    this.search.set('');
    this.selection.set(null);
  }

  changeFilter(change: (value: string) => void, value: string): void {
    this.selection.set(null);
    change(value);
  }
  readonly currentPage = computed(() => {
    const session = this.navigation.session();
    return session ? Math.floor(session.first() / session.rows()) : 0;
  });
  readonly totalPages = computed(() => {
    const session = this.navigation.session();
    return session ? Math.ceil(session.total() / session.rows()) : 0;
  });

  changePage(direction: -1 | 1): void {
    const session = this.navigation.session();
    const nextPage = this.currentPage() + direction;
    if (!session || session.loading() || nextPage < 0 || nextPage >= this.totalPages()) return;
    this.selection.set(null);
    session.paginate({ first: nextPage * session.rows(), rows: session.rows() });
  }

  onSearch(value: string): void {
    this.selection.set(null);
    this.search.set(value);
    this.navigation.session()?.search(value);
  }
}
