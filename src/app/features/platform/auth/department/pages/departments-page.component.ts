import { TranslateOptionsPipe } from '@core/i18n/translate-options.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { NavigationHistoryService } from '@core/navigation/navigation-history.service';
import { connectListNavigation } from '@shared/components/list/list-navigation.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { PaginatorModule } from 'primeng/paginator';
import { PopoverModule } from 'primeng/popover';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import {
  ListFilterComponent,
  ListActionButtonsComponent,
  ListAction,
  viewAction,
  editAction,
  deleteAction,
} from '@shared/components/list';

import { EmptyStateComponent } from '@shared/components/ui/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '@shared/components/ui/loading-spinner/loading-spinner.component';
import { PageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';

import { DetailsCardHeaderComponent } from '@shared/components/details/details-card-header/details-card-header.component';
import { DetailsInfoGridComponent } from '@shared/components/details/details-info-grid/details-info-grid.component';
import { DetailsInfoFieldComponent } from '@shared/components/details/details-info-field/details-info-field.component';
import { DetailActionsMenuComponent } from '@shared/components/details/detail-actions-menu/detail-actions-menu.component';
import {
  FormContainerComponent,
  TabContentComponent,
  TextInputComponent,
} from '@core/forms/components';
import { SearchFieldComponent } from '@shared/components/ui/search-field/search-field.component';
import { StatusBadgeComponent } from '@shared/components/ui/status-badge/status-badge.component';
import { TabsModule } from 'primeng/tabs';
import { TextareaModule } from 'primeng/textarea';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TableModule } from 'primeng/table';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FormHeaderComponent, FormActionsComponent } from '@core/forms/components';
import { ListContainerComponent } from '@shared/components/list';
import { PermissionDirective } from '@features/platform/auth/authorization/directives/permission.directive';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { MessageService, ConfirmationService, SortEvent } from 'primeng/api';
import { AccessManagementService } from '@features/platform/auth/authorization/services/access-management.service';
import { AuthorizationService } from '@features/platform/auth/authorization/services/authorization.service';
import { Department } from '@features/platform/auth/authorization/models/access.model';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';
import { DeleteDialogService } from '@shared/services/delete-dialog.service';
import { PanelCardComponent } from '@shared/components/ui/panel-card/panel-card.component';
import { BackButtonComponent } from '@shared/components/ui/back-button/back-button.component';
import { SubmitButtonComponent } from '@shared/components/ui/submit-button/submit-button.component';
import { PaginatorComponent } from '@shared/components/ui/paginator/paginator.component';
@Component({
  selector: 'app-departments-page',
  standalone: true,
  imports: [
    PaginatorComponent,
    SubmitButtonComponent,
    BackButtonComponent,
    PanelCardComponent,
    ListFilterComponent,
    TranslateOptionsPipe,
    TranslatePipe,
    ReactiveFormsModule,
    PaginatorModule,
    PopoverModule,
    SelectModule,
    TooltipModule,
    ListActionButtonsComponent,
    EmptyStateComponent,
    LoadingSpinnerComponent,
    PageHeaderComponent,
    DetailsCardHeaderComponent,
    DetailsInfoGridComponent,
    DetailsInfoFieldComponent,
    DetailActionsMenuComponent,
    FormContainerComponent,
    TabContentComponent,
    TextInputComponent,
    SearchFieldComponent,
    StatusBadgeComponent,
    TabsModule,
    TextareaModule,
    ToggleSwitchModule,
    TableModule,
    ConfirmDialogModule,
    FormHeaderComponent,
    FormActionsComponent,
    ListContainerComponent,
    PermissionDirective,
    FormsModule,
    ButtonModule,
  ],
  templateUrl: './departments-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DepartmentsPageComponent {
  private readonly deletion = inject(DeleteDialogService);
  private readonly navigationHistory = inject(NavigationHistoryService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly view = signal<'list' | 'detail' | 'form'>('list');
  readonly loading = signal(true);
  readonly first = signal(0);
  readonly rows = signal(10);
  readonly filterActive = signal('');
  readonly orderBy = signal<'name' | 'description'>('name');
  readonly orderDir = signal(1);
  onSort(event: SortEvent): void {
    const field = event.field === 'description' ? 'description' : 'name';
    const direction = event.order === -1 ? -1 : 1;
    if (this.orderBy() === field && this.orderDir() === direction) return;
    this.orderBy.set(field);
    this.orderDir.set(direction);
    this.first.set(0);
  }
  readonly activeOptions = [
    { label: 'Todos', value: '' },
    { label: 'Activos', value: 'true' },
    { label: 'Inactivos', value: 'false' },
  ];
  readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)],
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(500)],
    }),
    active: new FormControl(true, { nonNullable: true }),
  });
  control(name: 'name' | 'description'): FormControl<string> {
    return this.form.controls[name];
  }
  onBack(): void {
    this.navigationHistory.back(['/platform/departments']);
  }
  onCreate(): void {
    this.router.navigate(['/platform/departments', 'new']);
  }
  onView(item: Department): void {
    this.router.navigate(['/platform/departments', item.id]);
  }
  onEdit(item: { id: string }): void {
    this.router.navigate(['/platform/departments', item.id, 'edit']);
  }
  onSearch(term: string): void {
    this.search.set(term);
    this.first.set(0);
  }
  onFilter(value: string | null): void {
    this.filterActive.set(value ?? '');
    this.first.set(0);
  }
  onPageChange(event: { first?: number; rows?: number }): void {
    this.first.set(event.first ?? 0);
    this.rows.set(event.rows ?? 10);
  }
  readonly pageItems = computed(() =>
    this.filteredItems().slice(this.first(), this.first() + this.rows()),
  );
  actionsFor(item: Department): ListAction[] {
    const actions: ListAction[] = [viewAction(() => this.onView(item))];

    actions.push(editAction(() => this.onEdit(item)));
    actions.push(deleteAction(() => this.remove(item)));
    return actions;
  }
  private selectRoute(): void {
    const mode = this.route.snapshot.data['view'] ?? 'list';
    this.view.set(mode);
    if (mode === 'list') return;
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.create();
      return;
    }
    const item = this.items().find((value) => value.id === id);
    if (!item) {
      this.messages.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se encontró el departamento.',
      });
      void this.router.navigate(['/platform/departments']);
      return;
    }
    this.edit(item);
  }
  private readonly service = inject(AccessManagementService);
  private readonly messages = inject(MessageService);
  private readonly confirmation = inject(ConfirmationService);
  readonly authorization = inject(AuthorizationService);
  readonly module = BusinessModule.DEPARTMENTS;
  readonly items = signal<Department[]>([]);
  readonly editing = signal<Partial<Department> | null>(null);
  readonly busy = signal(false);
  readonly search = signal('');
  readonly filteredItems = computed(() => {
    const term = this.search().trim().toLocaleLowerCase();
    return this.items()
      .filter(
        (item) =>
          `${item.name} ${item.description ?? ''}`.toLocaleLowerCase().includes(term) &&
          (!this.filterActive() || String(item.active) === this.filterActive()),
      )
      .sort(
        (left, right) =>
          (left[this.orderBy()] ?? '').localeCompare(right[this.orderBy()] ?? '', 'es') *
          this.orderDir(),
      );
  });
  private readonly listNavigation = connectListNavigation({
    records: () => this.pageItems(),
    loading: () => this.loading(),
    total: () => this.filteredItems().length,
    first: () => this.first(),
    rows: () => this.rows(),
    search: (term) => {
      this.filterActive.set('');
      this.onSearch(term);
    },
    paginate: (event) => this.onPageChange(event),
    label: (record) => record.name,
    description: (record) => record.description,
    refresh: () => this.load(),
    actions: (record) => this.actionsFor(record),
  });

  constructor() {
    this.view.set(this.route.snapshot.data['view'] ?? 'list');
    this.load();
  }
  load(): void {
    this.loading.set(true);
    this.service.departments().subscribe({
      next: (items) => {
        this.items.set(items);
        if (this.first() >= this.filteredItems().length) this.first.set(0);
        this.loading.set(false);
        this.selectRoute();
      },
      error: (error) => {
        this.loading.set(false);
        this.fail(error);
        if (this.view() !== 'list') void this.router.navigate(['/platform/departments']);
      },
    });
  }
  create(): void {
    this.form.reset({ name: '', description: '', active: true });
    this.editing.set({ name: '', description: '', active: true });
  }
  edit(item: Department): void {
    this.form.reset({ name: item.name, description: item.description ?? '', active: item.active });
    this.editing.set({ ...item });
  }
  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.editing.update((value) => (value ? { ...value, ...this.form.getRawValue() } : value));
    this.save();
  }
  save(): void {
    const value = this.editing();
    if (
      !value?.name?.trim() ||
      this.busy() ||
      !this.authorization.can(this.module, value.id ? 'UPDATE' : 'CREATE')
    )
      return;
    this.busy.set(true);
    this.service.saveDepartment({ ...value, name: value.name.trim() }).subscribe({
      next: (saved) => {
        this.busy.set(false);
        this.editing.set(null);
        this.messages.add({
          severity: 'success',
          summary: 'Guardado',
          detail: 'Registro guardado correctamente.',
        });
        void this.router.navigate(['/platform/departments', saved.id]);
      },
      error: (error) => {
        this.busy.set(false);
        this.fail(error);
      },
    });
  }
  remove(item: Department): void {
    this.deletion.open('departments', item.id, item.name, () => this.load());
  }
  private fail(error: { status?: number; error?: { message?: string } }): void {
    this.messages.add({
      severity: 'error',
      summary: 'Error',
      detail:
        error.error?.message ??
        (error.status === 409
          ? 'El registro está en uso o fue modificado. Recarga antes de continuar.'
          : 'No se pudo completar la operación.'),
    });
  }
}
