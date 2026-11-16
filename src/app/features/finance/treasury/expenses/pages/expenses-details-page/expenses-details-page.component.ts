import { LocalizedCurrencyPipe, LocalizedDatePipe } from '@core/i18n/localized-format.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { NavigationHistoryService } from '@core/navigation/navigation-history.service';
import {
  provideTranslatedConfirmation,
  provideTranslatedMessages,
} from '@core/i18n/translated-feedback.service';
import { PermissionDirective } from '@features/platform/auth/authorization/directives/permission.directive';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ExpensesApplicationService } from '@features/finance/treasury/expenses/services/application/expenses-application.service';
import { ExpensePermission } from '@features/finance/treasury/expenses/permissions';
import { ExpenseCancelDialogComponent } from '@features/finance/treasury/expenses/components/expense-cancel-dialog/expense-cancel-dialog.component';
import { PageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';
import { PanelCardComponent } from '@shared/components/ui/panel-card/panel-card.component';
import { LoadingSpinnerComponent } from '@shared/components/ui/loading-spinner/loading-spinner.component';
import { BackButtonComponent } from '@shared/components/ui/back-button/back-button.component';
import { DetailActionsMenuComponent } from '@shared/components/details/detail-actions-menu/detail-actions-menu.component';
import { DetailsCardHeaderComponent } from '@shared/components/details/details-card-header/details-card-header.component';
import { DetailsInfoFieldComponent } from '@shared/components/details/details-info-field/details-info-field.component';
import { DetailsInfoGridComponent } from '@shared/components/details/details-info-grid/details-info-grid.component';

@Component({
  selector: 'app-expenses-details-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeaderComponent,
    PanelCardComponent,
    LoadingSpinnerComponent,
    BackButtonComponent,
    DetailActionsMenuComponent,
    DetailsCardHeaderComponent,
    DetailsInfoFieldComponent,
    DetailsInfoGridComponent,
    ExpenseCancelDialogComponent,
    ButtonModule,
    PermissionDirective,
    ConfirmDialogModule,
    TranslatePipe,
    LocalizedDatePipe,
    LocalizedCurrencyPipe,
  ],
  templateUrl: './expenses-details-page.component.html',
  providers: [provideTranslatedConfirmation(), provideTranslatedMessages()],
})
export class ExpensesDetailsPageComponent implements OnInit {
  protected readonly service = inject(ExpensesApplicationService);
  protected readonly ExpensePermission = ExpensePermission;
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly navigationHistory = inject(NavigationHistoryService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly expense = this.service.currentExpense;
  readonly cancelDialogVisible = signal(false);
  readonly canDelete = computed(() => {
    const expense = this.expense();
    return !!expense && !expense.cancelled && expense.registerStatus === 'OPEN';
  });
  readonly canCancel = computed(() => {
    const expense = this.expense();
    return !!expense && !expense.cancelled && expense.registerStatus === 'CLOSED';
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/finance/treasury/expenses']);
      return;
    }

    this.service.loadContext().subscribe();
    this.service.loadExpense(id).subscribe((found) => {
      if (!found) {
        this.router.navigate(['/finance/treasury/expenses']);
      }
    });
  }

  onBack(): void {
    this.navigationHistory.back(['/finance/treasury/expenses']);
  }

  onDelete(): void {
    const current = this.expense();
    if (!current) return;

    this.confirmation.confirm({
      header: 'Eliminar gasto',
      message: '¿Está seguro de que desea eliminar este gasto? Esta acción no se puede deshacer.',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.service.deleteExpense(current.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Gasto eliminado exitosamente',
              life: 3000,
            });
            this.router.navigate(['/finance/treasury/expenses']);
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al eliminar el gasto. Por favor, intente nuevamente.',
              life: 5000,
            });
          },
        });
      },
    });
  }

  onCancelExpense(): void {
    if (!this.canCancel()) return;
    this.cancelDialogVisible.set(true);
  }

  onCancelConfirmed(event: { id: string; reason: string }): void {
    this.service.cancelExpense(event.id, event.reason).subscribe({
      next: () => {
        this.cancelDialogVisible.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Gasto cancelado exitosamente',
          life: 3000,
        });
        this.service.loadExpense(event.id).subscribe();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cancelar el gasto. Por favor, intente nuevamente.',
          life: 5000,
        });
      },
    });
  }

  onCancelDialogClosed(): void {
    this.cancelDialogVisible.set(false);
  }
}
