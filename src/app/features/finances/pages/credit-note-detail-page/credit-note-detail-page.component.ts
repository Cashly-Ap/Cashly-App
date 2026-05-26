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
import { TextBadgeComponent } from '@shared/components/ui/text-badge/text-badge.component';
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
    TextBadgeComponent,
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

  canDelete(status: string): boolean {
    return status === 'DRAFT';
  }

  canCancel(status: string): boolean {
    return status === 'APPLIED';
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

  onCancel(): void {
    const note = this.noteData();
    if (!note) return;

    this.confirmationService.confirm({
      message: `¿Está seguro de que desea cancelar la nota de crédito #${note.noteNumber}?`,
      header: 'Confirmar Cancelación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, cancelar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.financeService.cancelCreditNote(note.id).subscribe({
          next: (updated) => {
            this.noteData.set(updated);
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Nota de crédito cancelada exitosamente',
              life: 3000,
            });
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al cancelar la nota de crédito',
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

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      DRAFT: 'Borrador',
      APPLIED: 'Aplicada',
      CANCELLED: 'Cancelada',
    };
    return labels[status] ?? status;
  }

  getStatusVariant(status: string): 'success' | 'danger' | 'info' | 'label' {
    const variants: Record<string, 'success' | 'danger' | 'info' | 'label'> = {
      DRAFT: 'label',
      APPLIED: 'success',
      CANCELLED: 'danger',
    };
    return variants[status] ?? 'label';
  }
}
