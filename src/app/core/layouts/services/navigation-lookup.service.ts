import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ListNavigationService } from '@shared/components/list/list-navigation.service';
import { NavigationLookupItem } from '@shared/components/list/list-navigation-data-source';
import { LIST_NAVIGATION_DEFINITIONS } from '../config/list-navigation.config';
import { moduleForUrl } from '@features/platform/auth/authorization/models/permission-context';
import { MessageService } from 'primeng/api';
import { ActionDialogService } from '@shared/services/action-dialog.service';
import { NavigationActionService } from '@shared/services/navigation-action.service';
import { DirectNavigationActionService } from '@shared/services/direct-navigation-action.service';
import { DeleteDialogService } from '@shared/services/delete-dialog.service';
import { CancelDialogService } from '@shared/services/cancel-dialog.service';
import { PdfActionService } from '@shared/services/pdf-action.service';
import { LookupSessionService } from './lookup-session.service';

const RECORD_PATH_SEGMENTS: Record<string, readonly string[]> = {
  'Ver detalle': [],
  Editar: ['edit'],
};

@Injectable({ providedIn: 'root' })
export class NavigationLookupService {
  private readonly router = inject(Router);
  private readonly navigation = inject(ListNavigationService);
  private readonly messages = inject(MessageService);
  private readonly actionDialogs = inject(ActionDialogService);
  private readonly navigationActions = inject(NavigationActionService);
  private readonly directActions = inject(DirectNavigationActionService);
  private readonly deletion = inject(DeleteDialogService);
  private readonly cancellation = inject(CancelDialogService);
  private readonly pdfActions = inject(PdfActionService);
  private readonly session = inject(LookupSessionService);

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
    this.session.open({
      route,
      label,
      module,
      definitionAction,
      queryParams,
      onSelect: (item) => this.handleRecordAction(route, label, item, queryParams),
    });
  }

  private handleRecordAction(
    route: string,
    label: string,
    item: NavigationLookupItem,
    queryParams?: Record<string, string>,
  ): void {
    const resource = route.split('/').filter(Boolean).at(-1) ?? '';
    if (label === 'Eliminar') {
      this.deletion.open(resource, item.id, item.label);
      return;
    }
    if (label === 'Cancelar') {
      this.cancellation.open(resource, item.id, item.label);
      return;
    }
    if (this.navigation.executeRecordAction(route, label, item.id)) return;
    if (this.actionDialogs.open(resource, label, item.id)) return;
    if (label === 'Descargar PDF') {
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
  }
}
