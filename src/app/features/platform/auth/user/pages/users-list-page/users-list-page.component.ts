import { TranslateOptionsPipe } from '@core/i18n/translate-options.pipe';
import { provideTranslatedConfirmation } from '@core/i18n/translated-feedback.service';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { connectListNavigation } from '@shared/components/list/list-navigation.service';
import { UserAvatarComponent } from '@shared/components/ui/user-avatar/user-avatar.component';
import { BusinessModule } from '../../models/enums/business-module.enum';
import { AuthorizationService } from '../../../authorization/services/authorization.service';
import {
  Component,
  inject,
  OnInit,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { AccessManagementService } from '../../../authorization/services/access-management.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { PaginatorModule } from 'primeng/paginator';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { PopoverModule } from 'primeng/popover';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
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
import { TextBadgeComponent } from '@shared/components/ui/text-badge/text-badge.component';
import { SearchFieldComponent } from '@shared/components/ui/search-field/search-field.component';
import { UserApplicationService } from '@features/platform/auth/user/services/application/user-application.service';
import { UserFilters } from '@features/platform/auth/user/services/api/user-api.service';
import { UserList } from '@features/platform/auth/user/models/interfaces/user-list.interface';
import { DeleteDialogService } from '@shared/services/delete-dialog.service';
import {
  getUserTypeLabel,
  UserType,
  USER_TYPES,
} from '@features/platform/auth/user/models/enums/user-type.enum';

import { PanelCardComponent } from '@shared/components/ui/panel-card/panel-card.component';
import { SubmitButtonComponent } from '@shared/components/ui/submit-button/submit-button.component';
import { PageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';
import { FilterFieldComponent } from '@shared/components/ui/filter-field/filter-field.component';
@Component({
  selector: 'app-users-list-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FilterFieldComponent,
    PageHeaderComponent,
    SubmitButtonComponent,
    PanelCardComponent,
    ListFilterComponent,
    TranslateOptionsPipe,
    TranslatePipe,
    UserAvatarComponent,
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    CardModule,
    TooltipModule,
    PaginatorModule,
    IconFieldModule,
    InputIconModule,
    ConfirmDialogModule,
    PopoverModule,
    SelectModule,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    SearchFieldComponent,
    ListContainerComponent,
    ListActionButtonsComponent,
    StatusBadgeComponent,
    TextBadgeComponent,
  ],
  templateUrl: './users-list-page.component.html',
  providers: [provideTranslatedConfirmation()],
})
export class UsersListPageComponent implements OnInit {
  private readonly deletion = inject(DeleteDialogService);
  readonly authorization = inject(AuthorizationService);
  readonly canFilterRoles = computed(
    () =>
      this.authorization.can(BusinessModule.USERS, 'CREATE') ||
      this.authorization.can(BusinessModule.USERS, 'UPDATE'),
  );
  private readonly management = inject(AccessManagementService);
  private service = inject(UserApplicationService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  users = this.service.users;
  loading = this.service.loading;
  totalElements = this.service.totalElements;

  searchTerm = signal('');
  first = signal(0);
  rows = signal(10);
  orderBy = signal('userName');
  orderDir = signal<'asc' | 'desc'>('asc');

  filterRole = signal<string>('');
  filterActive = signal<string>('true');

  activeFilterCount = computed(() => {
    let count = 0;
    if (this.filterRole()) count++;
    if (this.filterActive() !== 'true') count++;
    return count;
  });

  readonly roleOptions = signal([{ label: 'Todos los roles', value: '' }]);

  activeOptions = [
    { label: 'Activos', value: 'true' },
    { label: 'Inactivos', value: 'false' },
  ];

  showInitialLoading = computed(() => this.loading() && (this.users()?.length ?? 0) === 0);
  isEmptyDatabase = computed(
    () =>
      !this.loading() &&
      this.totalElements() === 0 &&
      this.activeFilterCount() === 0 &&
      !this.searchTerm(),
  );
  hasFilteredResults = computed(
    () =>
      !this.loading() &&
      this.totalElements() === 0 &&
      (this.activeFilterCount() > 0 || !!this.searchTerm()),
  );

  private readonly listNavigation = connectListNavigation({
    records: () => this.users(),
    loading: () => this.loading(),
    total: () => this.totalElements(),
    first: () => this.first(),
    rows: () => this.rows(),
    search: (term) => {
      this.filterActive.set('');
      this.filterRole.set('');
      this.onSearch(term);
    },
    paginate: (event) => this.onPageChange(event),
    label: (record) => record.userName,
    description: (record) => record.email,
    refresh: () => this.loadWithFilters(),
    actions: (record) => this.actionsFor(record),
  });

  ngOnInit(): void {
    if (this.canFilterRoles())
      this.management.roleOptions().subscribe({
        error: () => this.roleOptions.set([{ label: 'Todos los roles', value: '' }]),
        next: (items) =>
          this.roleOptions.set([
            { label: 'Todos los roles', value: '' },
            ...items.map((item) => ({ label: item.name, value: item.id })),
          ]),
      });
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
    const newField = event.field ?? 'userName';
    const newDir = event.order === 1 ? 'asc' : 'desc';
    if (newField === this.orderBy() && newDir === this.orderDir()) return;
    this.orderBy.set(newField);
    this.orderDir.set(newDir);
    this.first.set(0);
    this.loadWithFilters();
  }

  applyFilters(): void {
    this.first.set(0);
    this.loadWithFilters();
  }

  onRoleFilterChange(value: string | null): void {
    const normalized = value ?? '';
    if (normalized === this.filterRole()) return;
    this.filterRole.set(normalized);
    this.applyFilters();
  }

  onActiveFilterChange(value: string | null): void {
    const normalized = value ?? '';
    if (normalized === this.filterActive()) return;
    this.filterActive.set(normalized);
    this.applyFilters();
  }

  clearFilters(): void {
    this.filterRole.set('');
    this.filterActive.set('true');
    this.first.set(0);
    this.loadWithFilters();
  }

  private loadWithFilters(): void {
    const filters: UserFilters = {
      page: Math.floor(this.first() / this.rows()),
      size: this.rows(),
      orderBy: this.orderBy(),
      orderDir: this.orderDir(),
    };
    if (this.searchTerm()) filters.search = this.searchTerm();
    if (this.filterRole()) filters.role = this.filterRole();
    if (this.filterActive()) filters.active = this.filterActive() === 'true';
    this.service.loadUsers(filters).subscribe();
  }

  onCreate(): void {
    this.router.navigate(['/platform/users', 'new']);
  }

  onView(user: UserList): void {
    this.router.navigate(['/platform/users', user.id]);
  }

  onEdit(user: UserList): void {
    this.router.navigate(['/platform/users', user.id, 'edit']);
  }

  actionsFor(user: UserList): ListAction[] {
    const actions: ListAction[] = [
      viewAction(() => this.onView(user)),
      editAction(() => this.onEdit(user)),
    ];
    actions.push(deleteAction(() => this.onDelete(user)));
    return actions;
  }

  onDelete(user: UserList): void {
    this.deletion.open('users', user.id, user.userName, () => this.loadWithFilters());
  }

  getTypeLabel(type: UserType): string {
    return getUserTypeLabel(type);
  }
}
