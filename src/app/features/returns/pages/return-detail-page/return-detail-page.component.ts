import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MainLayoutComponent } from '@core/layouts/main-layout.component';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import {
  DetailsCardComponent,
  DetailsCardHeaderComponent,
  DetailsInfoFieldComponent,
  DetailsInfoGridComponent,
} from '@shared/components/details';
import {
  LoadingSpinnerComponent,
  PageHeaderComponent,
  TextBadgeComponent,
} from '@shared/components/ui';
import { ReturnApplicationService } from '@features/returns/services/application/return-application';

@Component({
  selector: 'app-return-detail-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    DecimalPipe,
    MainLayoutComponent,
    ButtonModule,
    TableModule,
    ConfirmDialogModule,
    DetailsCardComponent,
    DetailsCardHeaderComponent,
    DetailsInfoFieldComponent,
    DetailsInfoGridComponent,
    LoadingSpinnerComponent,
    PageHeaderComponent,
    TextBadgeComponent,
  ],
  providers: [ConfirmationService],
  templateUrl: './return-detail-page.component.html',
})
export class ReturnDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(ReturnApplicationService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly returnDetail = this.service.currentReturn;
  readonly loading = this.service.loading;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.service.loadReturnById(id).subscribe({
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar la devolución. Es posible que no exista.',
            life: 5000,
          });
          this.router.navigate(['/returns']);
        },
      });
    }
  }

  onBack(): void {
    this.router.navigate(['/returns']);
  }

  onDelete(): void {
    const ret = this.returnDetail();
    if (!ret) return;

    this.confirmationService.confirm({
      header: 'Eliminar Devolución',
      message: `¿Estás seguro de que deseas eliminar la devolución "${ret.returnNumber}"? Esta acción no se puede deshacer.`,
      acceptIcon: 'pi pi-trash',
      acceptLabel: 'Eliminar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.service.deleteReturn(ret.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Devolución eliminada exitosamente',
              life: 3000,
            });
            this.router.navigate(['/returns']);
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err?.error?.message || 'No se pudo eliminar la devolución.',
              life: 5000,
            });
          },
        });
      },
    });
  }

  getReturnTypeLabel(type: string): string {
    return type === 'AUTOMATIC' ? 'Automática' : 'Manual';
  }
}
