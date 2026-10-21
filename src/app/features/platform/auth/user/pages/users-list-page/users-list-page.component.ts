import { ShortcutDirective } from '@core/shortcuts/shortcut.directive';
import { UserAvatarComponent } from '@shared/components/ui/user-avatar/user-avatar.component';
import { BusinessModule } from '../../models/enums/business-module.enum';
import { AuthorizationService } from '../../../authorization/services/authorization.service';
import { PermissionDirective } from '@features/platform/auth/authorization/directives/permission.directive';
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
import { ContentCardComponent } from '@shared/components/ui/content-card/content-card.component';
import { LoadingSpinnerComponent } from '@shared/components/ui/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '@shared/components/ui/empty-state/empty-state.component';
import {
  ListAction,
  ListActionButtonsComponent,
  ListContainerComponent,
} from '@shared/components/list';
import { StatusBadgeComponent } from '@shared/components/ui/status-badge/status-badge.component';
import { TextBadgeComponent } from '@shared/components/ui/text-badge/text-badge.component';
import { SearchFieldComponent } from '@shared/components/ui/search-field/search-field.component';
import { UserApplicationService } from '@features/platform/auth/user/services/application/user-application.service';
import { UserFilters } from '@features/platform/auth/user/services/api/user-api.service';
import { UserList } from '@features/platform/auth/user/models/interfaces/user-list.interface';
import {
  getUserTypeLabel,
  UserType,
  USER_TYPES,
} from '@features/platform/auth/user/models/enums/user-type.enum';

@Component({
  selector: 'app-users-list-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ShortcutDirective,
    UserAvatarComponent,
    PermissionDirective,
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
    ContentCardComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    SearchFieldComponent,
    ListContainerComponent,
    ListActionButtonsComponent,
    StatusBadgeComponent,
    TextBadgeComponent,
  ],
  templateUrl: './users-list-page.component.html',
  providers: [ConfirmationService],
})
export class UsersListPageComponent implements OnInit {
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
      {
        requiredAction: 'READ',
        label: 'Ver detalle',
        icon: 'pi pi-eye',
        command: () => this.onView(user),
      },
      {
        requiredAction: 'UPDATE',
        label: 'Editar',
        icon: 'pi pi-pencil',
        command: () => this.onEdit(user),
      },
    ];
    if (user.deletable) {
      actions.push({
        requiredAction: 'DELETE',
        label: 'Eliminar',
        icon: 'pi pi-trash',
        danger: true,
        command: () => this.onDelete(user),
      });
    }
    return actions;
  }

  onDelete(user: UserList): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar el usuario "${user.userName}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.service.deleteUser(user.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Usuario eliminado exitosamente',
              life: 3000,
            });
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al eliminar el usuario. Por favor, intente nuevamente.',
              life: 5000,
            });
          },
        });
      },
    });
  }

  getTypeLabel(type: UserType): string {
    return getUserTypeLabel(type);
  }
}
