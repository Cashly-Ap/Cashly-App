import { Injectable, Injector, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  ListNavigationService,
  NavigationRecord,
} from '@shared/components/list/list-navigation.service';
import {
  loadNavigationLookup,
  NavigationLookupItem,
} from '@shared/components/list/list-navigation-data-source';
import { LIST_NAVIGATION_DEFINITIONS } from '../config/list-navigation.config';
import {
  lookupFilterDefaults,
  lookupFilterDefinitions,
  LookupFilterOption,
} from '../config/list-navigation-filters';
import { moduleForUrl } from '@features/platform/auth/authorization/models/permission-context';
import { CategoryApiService } from '@features/catalog/categories/services/api/category-api.service';
import { AccessManagementService } from '@features/platform/auth/authorization/services/access-management.service';
import { TranslationService } from '@core/i18n/translation.service';
import { MessageService } from 'primeng/api';
import { ActionDialogService } from '@shared/services/action-dialog.service';
import { NavigationActionService } from '@shared/services/navigation-action.service';
import { DirectNavigationActionService } from '@shared/services/direct-navigation-action.service';
import { DeleteDialogService } from '@shared/services/delete-dialog.service';
import { CancelDialogService } from '@shared/services/cancel-dialog.service';
import { PdfActionService } from '@shared/services/pdf-action.service';

const RECORD_PATH_SEGMENTS: Record<string, readonly string[]> = {
  'Ver detalle': [],
  Editar: ['edit'],
};

@Injectable({ providedIn: 'root' })
export class NavigationLookupService {
  private readonly injector = inject(Injector);
  private readonly router = inject(Router);
  private readonly navigation = inject(ListNavigationService);
  private readonly translations = inject(TranslationService);
  private readonly messages = inject(MessageService);
  private readonly actionDialogs = inject(ActionDialogService);
  private readonly navigationActions = inject(NavigationActionService);
  private readonly directActions = inject(DirectNavigationActionService);
  private readonly deletion = inject(DeleteDialogService);
  private readonly cancellation = inject(CancelDialogService);
  private readonly pdfActions = inject(PdfActionService);


  open(route: string, label: string, queryParams?: Record<string, string>): void {
    const definition = LIST_NAVIGATION_DEFINITIONS.find((item) => item.route === route);
    const destinationItem = definition?.destinations?.find((item) => item.label === label);
    if (destinationItem?.routerLink) {
      const destinationModule = destinationItem.requiredModule ?? null;
      if (
        !this.navigation.allowed(
          {
            label,
            icon: destinationItem.icon,
            requiredAction: destinationItem.requiredAction ?? 'READ',
            command: () => undefined,
          },
          destinationModule,
        )
      )
        return;
      this.navigation.dismiss();
      void this.router.navigate([destinationItem.routerLink], { queryParams });
      return;
    }
    const definitionAction = definition?.actions.find((item) => item.label === label);
    const module = moduleForUrl(route);
    if (!definitionAction || !module) return;
    const permission = { ...definitionAction, command: () => undefined };
    if (!this.navigation.allowed(permission, module)) return;
    this.navigation.dismiss();
    const resource = route.split('/').filter(Boolean).at(-1) ?? '';
    if (this.directActions.execute(resource, label)) return;
    const items = signal<NavigationLookupItem[]>([]);
    const loading = signal(false);
    const total = signal(0);
    const first = signal(0);
    const rows = signal(10);
    const filterValues = signal(lookupFilterDefaults(route));
    const filterSources: {
      values: Record<string, string>;
      categories: LookupFilterOption[];
      roles: LookupFilterOption[];
    } = {
      values: filterValues(),
      categories: [] as LookupFilterOption[],
      roles: [] as LookupFilterOption[],
    };
    const filters = () =>
      lookupFilterDefinitions(route, { ...filterSources, values: filterValues() }).map(
        (filter) => ({
          label: filter.label,
          value: filterValues()[filter.key] ?? filter.defaultValue,
          options: [...filter.options],
          change: (value: string) => {
            filterValues.update((values) => ({ ...values, [filter.key]: value }));
            first.set(0);
            load();
          },
        }),
      );
    let search = '';
    let request: Subscription | undefined;
    const owner = {};
    const records = computed<NavigationRecord[]>(() =>
      items().map((item) => ({
        id: item.id,
        key: item.id,
        label: item.label,
        description: item.description,
        action: () => ({
          ...definitionAction,
          command: () => {
            if (label === 'Eliminar') {
              const resource = route.split('/').filter(Boolean).at(-1) ?? '';
              this.deletion.open(resource, item.id, item.label);
              return;
            }
            if (label === 'Cancelar') {
              const resource = route.split('/').filter(Boolean).at(-1) ?? '';
              this.cancellation.open(resource, item.id, item.label);
              return;
            }
            if (this.navigation.executeRecordAction(route, label, item.id)) return;
            const resource = route.split('/').filter(Boolean).at(-1) ?? '';
            if (this.actionDialogs.open(resource, label, item.id)) return;
            if (label === 'Descargar PDF') {
              const resource = route.split('/').filter(Boolean).at(-1) ?? '';
              this.pdfActions.open(resource, item.id, item.label);
              return;
            }
            const recordPath = RECORD_PATH_SEGMENTS[label];
            if (recordPath) {
              void this.router.navigate([route, item.id, ...recordPath], { queryParams });
              return;
            }
            if (this.navigationActions.execute(resource, label, item)) return;
            this.messages.add({
              severity: 'warn',
              summary: label,
              detail: 'Esta acción todavía no está disponible.',
              life: 4000,
            });
          },
        }),
      })),
    );
    const load = () => {
      request?.unsubscribe();
      loading.set(true);
      const source = loadNavigationLookup(
        this.injector,
        route,
        label,
        search,
        Math.floor(first() / rows()),
        rows(),
        filterValues(),
      );
      request = source.subscribe({
        next: (result) => {
          items.set(result.items);
          total.set(result.total);
          loading.set(false);
        },
        error: () => {
          items.set([]);
          total.set(0);
          loading.set(false);
          this.messages.add({
            severity: 'error',
            summary: label,
            detail: 'No se pudieron cargar los registros. Intente buscar de nuevo.',
          });
        },
      });
    };
    if (route === '/catalog/products') {
      this.injector
        .get(CategoryApiService)
        .getAll({ active: true, page: 0, size: 1000 })
        .subscribe({
          next: (response) => {
            filterSources.categories = response.content.map((category) => ({
              label: category.name,
              value: category.id,
            }));
          },
          error: () => undefined,
        });
    }
    if (route === '/platform/users') {
      this.injector
        .get(AccessManagementService)
        .roleOptions()
        .subscribe({
          next: (roles) => {
            filterSources.roles = roles.map((role) => ({ label: role.name, value: role.id }));
          },
          error: () => undefined,
        });
    }
    this.navigation.session.set({
      owner,
      title: label,
      module,
      records,
      filters,
      loading,
      total,
      first,
      rows,
      search: (term) => {
        search = term;
        first.set(0);
        load();
      },
      paginate: (event) => {
        first.set(event.first);
        rows.set(event.rows);
        load();
      },
      onClose: () => request?.unsubscribe(),
    });
    load();
  }

}
