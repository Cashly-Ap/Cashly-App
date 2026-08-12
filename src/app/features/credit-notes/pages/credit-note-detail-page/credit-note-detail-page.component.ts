import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import {
  DetailsCardComponent,
  DetailsCardHeaderComponent,
  DetailsInfoFieldComponent,
  DetailsInfoGridComponent,
} from '@shared/components/details';
import { LoadingSpinnerComponent, PageHeaderComponent } from '@shared/components/ui';
import { CreditNoteApplicationService } from '@features/credit-notes/services/application/credit-note-application.service';

@Component({
  selector: 'app-credit-note-detail-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    DecimalPipe,
    ButtonModule,
    ConfirmDialogModule,
    DetailsCardComponent,
    DetailsCardHeaderComponent,
    DetailsInfoFieldComponent,
    DetailsInfoGridComponent,
    LoadingSpinnerComponent,
    PageHeaderComponent,
  ],
  providers: [ConfirmationService],
  templateUrl: './credit-note-detail-page.component.html',
})
export class CreditNoteDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(CreditNoteApplicationService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly creditNote = this.service.currentCreditNote;
  readonly loading = this.service.loading;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.service.loadCreditNoteById(id).subscribe({
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar la nota de crédito. Es posible que no exista.',
            life: 5000,
          });
          this.router.navigate(['/credit-notes']);
        },
      });
    }
  }

  onBack(): void {
    this.router.navigate(['/credit-notes']);
  }

  onDelete(): void {
    const cn = this.creditNote();
    if (!cn) return;

    this.confirmationService.confirm({
      header: 'Eliminar Nota de Crédito',
      message: `¿Estás seguro de que deseas eliminar la nota de crédito "${cn.noteNumber}"? Esta acción no se puede deshacer.`,
      acceptIcon: 'pi pi-trash',
      acceptLabel: 'Eliminar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.service.deleteCreditNote(cn.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Nota de crédito eliminada exitosamente',
              life: 3000,
            });
            this.router.navigate(['/credit-notes']);
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err?.error?.message || 'No se pudo eliminar la nota de crédito.',
              life: 5000,
            });
          },
        });
      },
    });
  }
}
