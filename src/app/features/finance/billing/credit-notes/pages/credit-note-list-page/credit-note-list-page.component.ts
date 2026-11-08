import { LanguageService } from '@core/i18n/language.service';
import { provideTranslatedConfirmation } from '@core/i18n/translated-feedback.service';
import { LocalizedNumberPipe } from '@core/i18n/localized-format.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { connectListNavigation } from '@shared/components/list/list-navigation.service';
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

import { LoadingSpinnerComponent } from '@shared/components/ui/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '@shared/components/ui/empty-state/empty-state.component';
import { SearchFieldComponent } from '@shared/components/ui/search-field/search-field.component';
import {
  ListFilterComponent,
  ListAction,
  ListActionButtonsComponent,
  ListContainerComponent,
  viewAction,
  deleteAction,
  auditHistoryAction,
} from '@shared/components/list';
import { CreditNoteApplicationService } from '@features/finance/billing/credit-notes/services/application/credit-note-application.service';
import { CreditNoteFilters } from '@features/finance/billing/credit-notes/services/api/credit-note-api.service';
import { CreditNoteList } from '@features/finance/billing/credit-notes/models/interfaces/credit-note.interface';
import { DeleteDialogService } from '@shared/services/delete-dialog.service';

import { PanelCardComponent } from '@shared/components/ui/panel-card/panel-card.component';
import { SubmitButtonComponent } from '@shared/components/ui/submit-button/submit-button.component';
import { PageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';
import { FilterFieldComponent } from '@shared/components/ui/filter-field/filter-field.component';
import { PaginatorComponent } from '@shared/components/ui/paginator/paginator.component';
@Component({
  selector: 'app-credit-note-list-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PaginatorComponent,
    FilterFieldComponent,
    PageHeaderComponent,
    SubmitButtonComponent,
    PanelCardComponent,
    ListFilterComponent,
    TranslatePipe,
    LocalizedNumberPipe,
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
    LoadingSpinnerComponent,
    EmptyStateComponent,
    SearchFieldComponent,
    ListContainerComponent,
    ListActionButtonsComponent,
  ],
  templateUrl: './credit-note-list-page.component.html',
  providers: [provideTranslatedConfirmation()],
})
export class CreditNoteListPageComponent implements OnInit {
  private readonly deletion = inject(DeleteDialogService);
  readonly locale = inject(LanguageService).locale;

  private service = inject(CreditNoteApplicationService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  creditNotes = this.service.creditNotes;
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

  showInitialLoading = computed(() => this.loading() && this.creditNotes().length === 0);
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
    return this.creditNotes().filter((record) =>
      `${record.noteNumber} ${record.customerName ?? ''}`.toLocaleLowerCase().includes(term),
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
    label: (record) => record.noteNumber,
    description: (record) => record.customerName ?? '',
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
    this.router.navigate(['/finance/billing/credit-notes/new']);
  }

  onDetail(creditNote: CreditNoteList): void {
    this.router.navigate(['/finance/billing/credit-notes', creditNote.id]);
  }

  actionsFor(creditNote: CreditNoteList): ListAction[] {
    return [
      viewAction(() => this.onDetail(creditNote)),
      deleteAction(() => this.onDelete(creditNote)),
      auditHistoryAction({
        entityType: 'CREDIT_NOTE',
        entityId: creditNote.id,
        label: creditNote.noteNumber,
      }),
    ];
  }

  onDelete(creditNote: CreditNoteList): void {
    this.deletion.open('credit-notes', creditNote.id, creditNote.noteNumber, () =>
      this.loadWithFilters(),
    );
  }

  private loadWithFilters(): void {
    const filters: CreditNoteFilters = {};
    if (this.dateFrom()) filters.dateFrom = this.dateFrom()!;
    if (this.dateTo()) filters.dateTo = this.dateTo()!;
    this.service.loadCreditNotes(filters).subscribe();
  }
}
