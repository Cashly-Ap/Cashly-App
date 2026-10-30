import { Injectable, Injector, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, map } from 'rxjs';
import {
  ListNavigationService,
  NavigationRecord,
} from '@shared/components/list/list-navigation.service';
import {
  loadNavigationLookup,
  NavigationLookupItem,
} from '@shared/components/list/list-navigation-data-source';
import { LIST_NAVIGATION_DEFINITIONS } from '../config/list-navigation.config';
import { moduleForUrl } from '@features/platform/auth/authorization/models/permission-context';
import { CashRegisterApiService } from '@features/finance/treasury/cash-register/services/api/cash-register-api.service';
import { MessageService } from 'primeng/api';
import { DocumentActionDialogService } from './document-action-dialog.service';

@Injectable({ providedIn: 'root' })
export class NavigationLookupService {
  private readonly injector = inject(Injector);
  private readonly router = inject(Router);
  private readonly navigation = inject(ListNavigationService);
  private readonly messages = inject(MessageService);
  private readonly documentActions = inject(DocumentActionDialogService);

  open(route: string, label: string, queryParams?: Record<string, string>): void {
    const definition = LIST_NAVIGATION_DEFINITIONS.find((item) => item.route === route);
    const definitionAction = definition?.actions.find((item) => item.label === label);
    const module = moduleForUrl(route);
    if (!definitionAction || !module) return;
    const permission = { ...definitionAction, command: () => undefined };
    if (!this.navigation.allowed(permission, module)) return;
    this.navigation.dismiss();
    const items = signal<NavigationLookupItem[]>([]);
    const loading = signal(false);
    const total = signal(0);
    const first = signal(0);
    const rows = signal(10);
    let search = '';
    let request: Subscription | undefined;
    const owner = {};
    const modalAction =
      (route === '/sales/orders' &&
        ['Confirmar', 'Convertir a factura', 'Cancelar'].includes(label)) ||
      (route === '/sales/quotes' &&
        ['Convertir a pedido', 'Convertir a factura'].includes(label)) ||
      (route === '/procurement/purchases' &&
        ['Confirmar compra', 'Cancelar compra'].includes(label));
    const records = computed<NavigationRecord[]>(() =>
      items().map((item) => ({
        key: item.id,
        label: item.label,
        description: item.description,
        action: () => ({
          ...definitionAction,
          command: () => {
            if (modalAction) {
              this.documentActions.open({
                route: route as '/sales/quotes' | '/sales/orders' | '/procurement/purchases',
                label,
                recordId: item.id,
                recordLabel: item.label,
              });
              return;
            }
            void this.router.navigate([route], {
              queryParams: {
                ...queryParams,
                navAction: label,
                ...(route.endsWith('/cash-register')
                  ? {}
                  : { navRecord: item.id, navSearch: item.label }),
              },
            });
          },
        }),
      })),
    );
    const load = () => {
      request?.unsubscribe();
      loading.set(true);
      const source = route.endsWith('/cash-register')
        ? this.injector
            .get(CashRegisterApiService)
            .getActive()
            .pipe(
              map((closure) => {
                const eligible =
                  label === 'Abrir caja'
                    ? !closure
                    : label === 'Cerrar caja'
                      ? closure?.status === 'OPEN'
                      : !!closure;
                const entries = eligible
                  ? [
                      {
                        id: closure?.id ?? 'new',
                        label: 'Caja',
                        description: closure
                          ? `${closure.openedByName} · ${closure.status}`
                          : 'Abrir una nueva sesión de caja',
                      },
                    ]
                  : [];
                return { items: entries, total: entries.length };
              }),
            )
        : loadNavigationLookup(
            this.injector,
            route,
            label,
            search,
            Math.floor(first() / rows()),
            rows(),
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
    this.navigation.session.set({
      owner,
      title: label,
      module,
      records,
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
