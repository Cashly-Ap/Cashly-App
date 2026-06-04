import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MainLayoutComponent } from '@core/layouts/main-layout.component';
import { ButtonModule } from 'primeng/button';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import {
  DetailsCardComponent,
  DetailsCardHeaderComponent,
  DetailsInfoFieldComponent,
  DetailsInfoGridComponent,
} from '@shared/components/details';
import { LoadingSpinnerComponent, PageHeaderComponent } from '@shared/components/ui';
import { AdvanceApplicationService } from '../../services/application/advance-application.service';
import { AdvanceStatus, getAdvanceStatusLabel } from '../../models/enums';

@Component({
  selector: 'app-advance-detail-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    DatePipe,
    DecimalPipe,
    MainLayoutComponent,
    ButtonModule,
    ConfirmDialogModule,
    TableModule,
    DetailsCardComponent,
    DetailsCardHeaderComponent,
    DetailsInfoFieldComponent,
    DetailsInfoGridComponent,
    LoadingSpinnerComponent,
    PageHeaderComponent,
  ],
  providers: [ConfirmationService],
  templateUrl: './advance-detail-page.component.html',
})
export class AdvanceDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(AdvanceApplicationService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly advance = this.service.currentAdvance;
  readonly loading = this.service.loading;

  labelForStatus(status: AdvanceStatus): string {
    return getAdvanceStatusLabel(status);
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.service.loadById(id).subscribe({
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar el anticipo. Es posible que no exista.',
            life: 5000,
          });
          this.router.navigate(['/advances']);
        },
      });
    }
  }

  onBack(): void {
    this.router.navigate(['/advances']);
  }

  onCancel(): void {
    const a = this.advance();
    if (!a) return;
    this.confirmationService.confirm({
      header: 'Anular Anticipo',
      message: `¿Estás seguro de que deseas anular el anticipo "${a.advanceNumber}"? Esta acción no se puede deshacer.`,
      acceptIcon: 'pi pi-ban',
      acceptLabel: 'Anular',
      acceptButtonStyleClass: 'p-button-danger',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.service.cancel(a.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Anticipo anulado exitosamente',
              life: 3000,
            });
            this.router.navigate(['/advances']);
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err?.error?.message || 'No se pudo anular el anticipo.',
              life: 5000,
            });
          },
        });
      },
    });
  }

  statusSeverity(status: AdvanceStatus): string {
    switch (status) {
      case AdvanceStatus.ACTIVE:
        return 'success';
      case AdvanceStatus.PARTIALLY_CONSUMED:
        return 'warn';
      case AdvanceStatus.FULLY_CONSUMED:
        return 'info';
      case AdvanceStatus.CANCELLED:
        return 'danger';
      default:
        return 'contrast';
    }
  }
}
