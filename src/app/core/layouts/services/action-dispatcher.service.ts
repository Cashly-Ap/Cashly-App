import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from '@core/layouts/models';
import { ListNavigationService } from '@shared/components/list/list-navigation.service';
import { NavigationLookupItem } from '@shared/components/list/list-navigation-data-source';
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

export interface ActionDispatchContext {
  route: string;
  label: string;
  record: NavigationLookupItem;
  queryParams?: Record<string, string>;
}

@Injectable({ providedIn: 'root' })
export class ActionDispatcherService {
  private readonly router = inject(Router);
  private readonly navigation = inject(ListNavigationService);
  private readonly messages = inject(MessageService);
  private readonly actionDialogs = inject(ActionDialogService);
  private readonly navigationActions = inject(NavigationActionService);
  private readonly directActions = inject(DirectNavigationActionService);
  private readonly deletion = inject(DeleteDialogService);
  private readonly cancellation = inject(CancelDialogService);
  private readonly pdfActions = inject(PdfActionService);

  dispatchDestination(destination: MenuItem, queryParams?: Record<string, string>): void {
    if (!destination.routerLink) return;
    void this.router.navigate([destination.routerLink], { queryParams });
  }

  dispatchDirect(route: string, label: string): boolean {
    return this.directActions.execute(this.resource(route), label);
  }

  dispatchRecord(context: ActionDispatchContext): boolean {
    const { route, label, record, queryParams } = context;
    const resource = this.resource(route);
    if (label === 'Eliminar') {
      this.deletion.open(resource, record.id, record.label);
      return true;
    }
    if (label === 'Cancelar') {
      this.cancellation.open(resource, record.id, record.label);
      return true;
    }
    if (this.navigation.executeRecordAction(route, label, record.id)) return true;
    if (this.actionDialogs.open(resource, label, record.id)) return true;
    if (label === 'Descargar PDF') {
      this.pdfActions.open(resource, record.id, record.label);
      return true;
    }
    const recordPath = RECORD_PATH_SEGMENTS[label];
    if (recordPath) {
      void this.router.navigate([route, record.id, ...recordPath], { queryParams });
      return true;
    }
    if (this.navigationActions.execute(resource, label, record)) return true;
    this.messages.add({
      severity: 'warn',
      summary: label,
      detail: 'Esta acción todavía no está disponible.',
      life: 4000,
    });
    return false;
  }

  private resource(route: string): string {
    return route.split('/').filter(Boolean).at(-1) ?? '';
  }
}
