import {
  Component,
  inject,
  OnInit,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { PopoverModule } from 'primeng/popover';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DatePickerModule } from 'primeng/datepicker';
import { ContentCardComponent } from '@shared/components/ui/content-card/content-card.component';
import { LoadingSpinnerComponent } from '@shared/components/ui/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '@shared/components/ui/empty-state/empty-state.component';
import { ListContainerComponent } from '@shared/components/list/list-container/list-container.component';
import { DebitNoteApplicationService } from '@features/debit-notes/services/application/debit-note-application.service';
import { DebitNoteFilters } from '@features/debit-notes/services/api/debit-note-api.service';
import { DebitNoteList } from '@features/debit-notes/models/interfaces';

@Component({
  selector: 'app-debit-note-list-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    PaginatorModule,
    IconFieldModule,
    InputIconModule,
    ConfirmDialogModule,
    PopoverModule,
    TooltipModule,
    DatePickerModule,
    ContentCardComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ListContainerComponent,
  ],
  templateUrl: './debit-note-list-page.component.html',
  providers: [ConfirmationService],
})
export class DebitNoteListPageComponent implements OnInit {
  private service = inject(DebitNoteApplicationService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  debitNotes = this.service.debitNotes;
  loading = this.service.loading;
  totalElements = this.service.totalElements;

  searchTerm = signal('');
  first = signal(0);
  rows = signal(10);
  dateFrom = signal<string | null>(null);
  dateTo = signal<string | null>(null);

  activeFilterCount = computed(() => {
    let count = 0;
    if (this.dateFrom()) count++;
    if (this.dateTo()) count++;
    return count;
  });

  showInitialLoading = computed(() => this.loading() && this.debitNotes().length === 0);
  isEmptyDatabase = computed(
    () =>
      !this.loading() &&
      this.totalElements() === 0 &&
      !this.dateFrom() &&
      !this.dateTo() &&
      !this.searchTerm(),
  );
  hasFilteredResults = computed(
    () =>
      !this.loading() &&
      this.totalElements() === 0 &&
      (this.dateFrom() || this.dateTo() || !!this.searchTerm()),
  );

  ngOnInit(): void {
    this.loadWithFilters();
  }

  onSearch(value: string): void {
    this.searchTerm.set(value);
    this.first.set(0);
    this.loadWithFilters();
  }

  onPageChange(event: { first: number; rows: number }): void {
    this.first.set(event.first ?? 0);
    this.rows.set(event.rows ?? 10);
    this.loadWithFilters();
  }

  clearFilters(): void {
    this.dateFrom.set(null);
    this.dateTo.set(null);
    this.first.set(0);
    this.loadWithFilters();
  }

  onCreate(): void {
    this.router.navigate(['/debit-notes/new']);
  }

  onDetail(debitNote: DebitNoteList): void {
    this.router.navigate(['/debit-notes', debitNote.id]);
  }

  onDelete(debitNote: DebitNoteList): void {
    this.confirmationService.confirm({
      header: 'Eliminar Nota de Débito',
      message: `¿Estás seguro de que deseas eliminar la nota de débito "${debitNote.noteNumber}"? Esta acción no se puede deshacer.`,
      acceptIcon: 'pi pi-trash',
      acceptLabel: 'Eliminar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.service.deleteDebitNote(debitNote.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Nota de débito eliminada exitosamente',
              life: 3000,
            });
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

  protected loadWithFilters(): void {
    const filters: DebitNoteFilters = {};
    if (this.dateFrom()) filters.dateFrom = this.dateFrom()!;
    if (this.dateTo()) filters.dateTo = this.dateTo()!;
    this.service.loadDebitNotes(filters).subscribe();
  }
}
