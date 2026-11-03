import { LanguageService } from '@core/i18n/language.service';
import { provideTranslatedConfirmation } from '@core/i18n/translated-feedback.service';
import { LocalizedNumberPipe } from '@core/i18n/localized-format.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { connectListNavigation } from '@shared/components/list/list-navigation.service';
import { ShortcutDirective } from '@core/shortcuts/shortcut.directive';
import { PermissionDirective } from '@features/platform/auth/authorization/directives/permission.directive';
import {
  Component,
  inject,
  OnInit,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { PopoverModule } from 'primeng/popover';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DatePickerModule } from 'primeng/datepicker';
import { ContentCardComponent } from '@shared/components/ui/content-card/content-card.component';
import { LoadingSpinnerComponent } from '@shared/components/ui/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '@shared/components/ui/empty-state/empty-state.component';
import { TextBadgeComponent } from '@shared/components/ui/text-badge/text-badge.component';
import { SearchFieldComponent } from '@shared/components/ui/search-field/search-field.component';
import {
  ListFilterComponent,
  ListAction,
  ListActionButtonsComponent,
  ListContainerComponent,
} from '@shared/components/list';
import { ReturnApplicationService } from '@features/finance/billing/returns/services/application/return-application.service';
import { ReturnFilters } from '@features/finance/billing/returns/services/api/return-api.service';
import { ReturnList } from '@features/finance/billing/returns/models/interfaces/return.interface';
import { DeleteDialogService } from '@shared/services/delete-dialog.service';

@Component({
  selector: 'app-return-list-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ListFilterComponent,
    TranslatePipe,
    LocalizedNumberPipe,
    ShortcutDirective,
    PermissionDirective,
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    PaginatorModule,
    IconFieldModule,
    InputIconModule,
    ConfirmDialogModule,
    PopoverModule,
    TooltipModule,
    DatePickerModule,
    ContentCardComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    SearchFieldComponent,
    TextBadgeComponent,
    ListContainerComponent,
    ListActionButtonsComponent,
  ],
  templateUrl: './return-list-page.component.html',
  providers: [provideTranslatedConfirmation()],
})
export class ReturnListPageComponent implements OnInit {
  private readonly deletion = inject(DeleteDialogService);
  readonly locale = inject(LanguageService).locale;

  private service = inject(ReturnApplicationService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  returns = this.service.returns;
  loading = this.service.loading;
  totalElements = this.service.totalElements;

  searchTerm = signal('');
  first = signal(0);
  rows = signal(10);
  dateFrom = signal<string | null>(null);
  dateTo = signal<string | null>(null);

  activeFilterCount = computed(() => {
    let count = 0;
    if (this.dateFrom()) count++;
    if (this.dateTo()) count++;
    return count;
  });

  showInitialLoading = computed(() => this.loading() && this.returns().length === 0);
  isEmptyDatabase = computed(
    () =>
      !this.loading() &&
      this.totalElements() === 0 &&
      !this.dateFrom() &&
      !this.dateTo() &&
      !this.searchTerm(),
  );
  hasFilteredResults = computed(
    () =>
      !this.loading() &&
      this.totalElements() === 0 &&
      (this.dateFrom() || this.dateTo() || !!this.searchTerm()),
  );

  private readonly navigationRecords = computed(() => {
    const term = this.searchTerm().trim().toLocaleLowerCase();
    return this.returns().filter((record) =>
      `${record.returnNumber} ${record.customerName ?? ''}`.toLocaleLowerCase().includes(term),
    );
  });

  private readonly listNavigation = connectListNavigation({
    records: () => this.navigationRecords().slice(this.first(), this.first() + this.rows()),
    loading: () => this.loading(),
    total: () => this.navigationRecords().length,
    first: () => this.first(),
    rows: () => this.rows(),
    search: (term) => {
      this.dateFrom.set(null);
      this.dateTo.set(null);
      this.onSearch(term);
    },
    paginate: (event) => this.onPageChange(event),
    label: (record) => record.returnNumber,
    description: (record) => record.customerName,
    refresh: () => this.loadWithFilters(),
    actions: (record) => this.actionsFor(record),
  });

  ngOnInit(): void {
    this.loadWithFilters();
  }

  onSearch(value: string): void {
    this.searchTerm.set(value);
    this.first.set(0);
    this.loadWithFilters();
  }

  onPageChange(event: { first: number; rows: number }): void {
    this.first.set(event.first ?? 0);
    this.rows.set(event.rows ?? 10);
    this.loadWithFilters();
  }

  clearFilters(): void {
    this.dateFrom.set(null);
    this.dateTo.set(null);
    this.first.set(0);
    this.loadWithFilters();
  }

  onCreate(): void {
    this.router.navigate(['/finance/billing/returns/new']);
  }

  onDetail(ret: ReturnList): void {
    this.router.navigate(['/finance/billing/returns', ret.id]);
  }

  actionsFor(ret: ReturnList): ListAction[] {
    return [
      {
        requiredAction: 'READ',
        label: 'Ver detalle',
        icon: 'pi pi-eye',
        command: () => this.onDetail(ret),
      },
      {
        requiredAction: 'DELETE',
        label: 'Eliminar',
        icon: 'pi pi-trash',
        danger: true,
        command: () => this.onDelete(ret),
      },
    ];
  }

  onDelete(ret: ReturnList): void {
    this.deletion.open('returns', ret.id, ret.returnNumber, () => this.loadWithFilters());
  }

  getReturnTypeLabel(type: string): string {
    return type === 'AUTOMATIC' ? 'Automática' : 'Manual';
  }

  protected loadWithFilters(): void {
    const filters: ReturnFilters = {};
    if (this.dateFrom()) filters.dateFrom = this.dateFrom()!;
    if (this.dateTo()) filters.dateTo = this.dateTo()!;
    this.service.loadReturns(filters).subscribe();
  }
}
