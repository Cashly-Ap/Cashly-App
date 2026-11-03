import { TranslateOptionsPipe } from '@core/i18n/translate-options.pipe';
import { provideTranslatedConfirmation } from '@core/i18n/translated-feedback.service';
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
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService, SortEvent } from 'primeng/api';

import { LoadingSpinnerComponent } from '@shared/components/ui/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '@shared/components/ui/empty-state/empty-state.component';
import {
  ListFilterComponent,
  ListAction,
  ListActionButtonsComponent,
  ListContainerComponent,
  viewAction,
  editAction,
  deleteAction,
} from '@shared/components/list';
import { StatusBadgeComponent } from '@shared/components/ui/status-badge/status-badge.component';
import { SearchFieldComponent } from '@shared/components/ui/search-field/search-field.component';
import { PaymentMethodApplicationService } from '@features/finance/treasury/payment-methods/services/application/payment-method-application.service';
import { PaymentMethodFilters } from '@features/finance/treasury/payment-methods/services/api/payment-method-api.service';
import { PaymentMethodList } from '@features/finance/treasury/payment-methods/models/interfaces/payment-method.interface';
import { DeleteDialogService } from '@shared/services/delete-dialog.service';

import { PanelCardComponent } from '@shared/components/ui/panel-card/panel-card.component';
@Component({
  selector: 'app-payment-method-list-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PanelCardComponent,
    ListFilterComponent,
    TranslateOptionsPipe,
    TranslatePipe,
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
    SelectModule,
    TooltipModule,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    SearchFieldComponent,
    ListContainerComponent,
    ListActionButtonsComponent,
    StatusBadgeComponent,
  ],
  templateUrl: './payment-method-list-page.component.html',
  providers: [provideTranslatedConfirmation()],
})
export class PaymentMethodListPageComponent implements OnInit {
  private readonly deletion = inject(DeleteDialogService);
  private service = inject(PaymentMethodApplicationService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  paymentMethods = this.service.paymentMethods;
  loading = this.service.loading;
  totalElements = this.service.totalElements;

  searchTerm = signal('');
  first = signal(0);
  rows = signal(10);
  orderBy = signal('name');
  orderDir = signal<'asc' | 'desc'>('asc');
  filterActive = signal('true');

  activeFilterOptions = [
    { label: 'Activos', value: 'true' },
    { label: 'Inactivos', value: 'false' },
  ];

  activeFilterCount = computed(() => (this.filterActive() !== 'true' ? 1 : 0));

  showInitialLoading = computed(() => this.loading() && this.paymentMethods().length === 0);
  isEmptyDatabase = computed(
    () =>
      !this.loading() &&
      this.totalElements() === 0 &&
      this.filterActive() === 'true' &&
      !this.searchTerm(),
  );
  hasFilteredResults = computed(
    () =>
      !this.loading() &&
      this.totalElements() === 0 &&
      (this.filterActive() !== 'true' || !!this.searchTerm()),
  );

  private readonly listNavigation = connectListNavigation({
    records: () => this.paymentMethods(),
    loading: () => this.loading(),
    total: () => this.totalElements(),
    first: () => this.first(),
    rows: () => this.rows(),
    search: (term) => {
      this.filterActive.set('');
      this.onSearch(term);
    },
    paginate: (event) => this.onPageChange(event),
    label: (record) => record.name,
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

  onSort(event: SortEvent): void {
    const newField = event.field ?? 'name';
    const newDir = event.order === 1 ? 'asc' : 'desc';
    if (newField === this.orderBy() && newDir === this.orderDir()) return;
    this.orderBy.set(newField);
    this.orderDir.set(newDir);
    this.first.set(0);
    this.loadWithFilters();
  }

  onActiveFilterChange(value: string | null): void {
    this.filterActive.set(value ?? '');
    this.first.set(0);
    this.loadWithFilters();
  }

  clearFilters(): void {
    this.filterActive.set('true');
    this.first.set(0);
    this.loadWithFilters();
  }

  onCreate(): void {
    this.router.navigate(['/finance/treasury/payment-methods/new']);
  }

  onDetail(paymentMethod: PaymentMethodList): void {
    this.router.navigate(['/finance/treasury/payment-methods', paymentMethod.id]);
  }

  onEdit(paymentMethod: PaymentMethodList): void {
    this.router.navigate(['/finance/treasury/payment-methods', paymentMethod.id, 'edit']);
  }

  actionsFor(paymentMethod: PaymentMethodList): ListAction[] {
    const actions: ListAction[] = [
      viewAction(() => this.onDetail(paymentMethod)),
      editAction(() => this.onEdit(paymentMethod)),
    ];
    if (!paymentMethod.hasAssociatedRecords) {
      actions.push(deleteAction(() => this.onDelete(paymentMethod)));
    }
    return actions;
  }

  onDelete(paymentMethod: PaymentMethodList): void {
    this.deletion.open('payment-methods', paymentMethod.id, paymentMethod.name, () =>
      this.loadWithFilters(),
    );
  }

  private loadWithFilters(): void {
    const filters: PaymentMethodFilters = {
      page: Math.floor(this.first() / this.rows()),
      size: this.rows(),
      orderBy: this.orderBy(),
      orderDir: this.orderDir(),
    };
    if (this.searchTerm()) filters.search = this.searchTerm();
    if (this.filterActive()) filters.active = this.filterActive() === 'true';
    this.service.loadPaymentMethods(filters).subscribe();
  }
}
