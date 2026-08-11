import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
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
import {
  LoadingSpinnerComponent,
  PageHeaderComponent,
} from '@shared/components/ui';
import { DebitNoteApplicationService } from '@features/debit-notes/services/application/debit-note-application.service';

@Component({
  selector: 'app-debit-note-detail-page',
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
  templateUrl: './debit-note-detail-page.component.html',
})
export class DebitNoteDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(DebitNoteApplicationService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly debitNote = this.service.currentDebitNote;
  readonly loading = this.service.loading;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.service.loadDebitNoteById(id).subscribe({
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar la nota de débito. Es posible que no exista.',
            life: 5000,
          });
          this.router.navigate(['/debit-notes']);
        },
      });
    }
  }

  onBack(): void {
    this.router.navigate(['/debit-notes']);
  }

  onDelete(): void {
    const dn = this.debitNote();
    if (!dn) return;

    this.confirmationService.confirm({
      header: 'Eliminar Nota de Débito',
      message: `¿Estás seguro de que deseas eliminar la nota de débito "${dn.noteNumber}"? Esta acción no se puede deshacer.`,
      acceptIcon: 'pi pi-trash',
      acceptLabel: 'Eliminar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.service.deleteDebitNote(dn.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Nota de débito eliminada exitosamente',
              life: 3000,
            });
            this.router.navigate(['/debit-notes']);
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err?.error?.message || 'No se pudo eliminar la nota de débito.',
              life: 5000,
            });
          },
        });
      },
    });
  }
}
