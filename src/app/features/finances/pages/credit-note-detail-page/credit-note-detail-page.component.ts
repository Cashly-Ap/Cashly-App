import { ChangeDetectionStrategy, Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MainLayoutComponent } from '@core/layouts/main-layout.component';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import {
  DetailsCardComponent,
  DetailsCardHeaderComponent,
  DetailsInfoFieldComponent,
  DetailsInfoGridComponent,
} from '@shared/components/details';
import { LoadingSpinnerComponent } from '@shared/components/ui/loading-spinner/loading-spinner.component';
import { PageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';
import { FinanceApplicationService } from '@features/finances/services/application/finance-application.service';
import { CreditNoteDetail } from '@features/finances/models/interfaces';

@Component({
  selector: 'app-credit-note-detail-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MainLayoutComponent,
    ButtonModule,
    ConfirmDialogModule,
    DetailsCardComponent,
    DetailsCardHeaderComponent,
    DetailsInfoFieldComponent,
    DetailsInfoGridComponent,
    LoadingSpinnerComponent,
    PageHeaderComponent,
  ],
  templateUrl: './credit-note-detail-page.component.html',
  providers: [ConfirmationService],
})
export class CreditNoteDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly financeService = inject(FinanceApplicationService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly noteData = signal<CreditNoteDetail | null>(null);
  readonly loading = this.financeService.loading;

  readonly showLoading = computed(() => this.loading() && !this.noteData());

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.financeService.loadCreditNoteById(id).subscribe({
        next: (note) => this.noteData.set(note),
      });
    }
  }

  onDelete(): void {
    const note = this.noteData();
    if (!note) return;

    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar la nota de crédito #${note.noteNumber}? Esta acción no se puede deshacer.`,
      header: 'Eliminar Nota de Crédito',
      icon: 'pi pi-trash',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.financeService.deleteCreditNote(note.id).subscribe({
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
              detail: err?.error?.message || 'Error al eliminar la nota de crédito',
              life: 5000,
            });
          },
        });
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/credit-notes']);
  }
}
