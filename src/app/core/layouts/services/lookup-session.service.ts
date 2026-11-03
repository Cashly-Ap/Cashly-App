import { Injectable, Injector, computed, inject, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import {
  ListNavigationService,
  NavigationRecord,
} from '@shared/components/list/list-navigation.service';
import {
  loadNavigationLookup,
  NavigationLookupItem,
} from '@shared/components/list/list-navigation-data-source';
import { NavigationActionDefinition } from '@core/layouts/config/list-navigation.config';
import {
  lookupFilterDefaults,
  lookupFilterDefinitions,
  LookupFilterOption,
} from '@core/layouts/config/list-navigation-filters';
import { CategoryApiService } from '@features/catalog/categories/services/api/category-api.service';
import { AccessManagementService } from '@features/platform/auth/authorization/services/access-management.service';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';
import { MessageService } from 'primeng/api';

export interface LookupSessionConfig {
  route: string;
  label: string;
  module: BusinessModule;
  definitionAction: NavigationActionDefinition;
  queryParams?: Record<string, string>;
  onSelect: (item: NavigationLookupItem) => void;
}

@Injectable({ providedIn: 'root' })
export class LookupSessionService {
  private readonly injector = inject(Injector);
  private readonly navigation = inject(ListNavigationService);
  private readonly messages = inject(MessageService);

  open(config: LookupSessionConfig): void {
    const { route, label, module, definitionAction, onSelect } = config;
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
          command: () => onSelect(item),
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
