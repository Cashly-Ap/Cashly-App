import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { DetailActionsMenuComponent } from '@shared/components/details/detail-actions-menu/detail-actions-menu.component';
import { DetailsCardComponent } from '@shared/components/details/details-card/details-card.component';
import { DetailsCardHeaderComponent } from '@shared/components/details/details-card-header/details-card-header.component';
import { DetailsInfoFieldComponent } from '@shared/components/details/details-info-field/details-info-field.component';
import { DetailsInfoGridComponent } from '@shared/components/details/details-info-grid/details-info-grid.component';
import { DetailsSectionCardComponent } from '@shared/components/details/details-section-card/details-section-card.component';
import { EmptyStateComponent } from '@shared/components/ui/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '@shared/components/ui/loading-spinner/loading-spinner.component';
import { PageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';
import { TextBadgeComponent } from '@shared/components/ui/text-badge/text-badge.component';
import { QuoteApplicationService } from '@features/sales/quotes/services/application/quote-application.service';
import {
  QuoteStatus,
  getQuoteStatusLabel,
} from '@features/sales/quotes/models/enums/quote-status.enum';

@Component({
  selector: 'app-quote-detail-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    DecimalPipe,
    ButtonModule,
    TableModule,
    DetailActionsMenuComponent,
    DetailsCardComponent,
    DetailsCardHeaderComponent,
    DetailsInfoFieldComponent,
    DetailsInfoGridComponent,
    DetailsSectionCardComponent,
    EmptyStateComponent,
    LoadingSpinnerComponent,
    PageHeaderComponent,
    TextBadgeComponent,
  ],
  templateUrl: './quote-detail-page.component.html',
})
export class QuoteDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly quoteService = inject(QuoteApplicationService);
  private readonly messageService = inject(MessageService);

  readonly quote = this.quoteService.currentQuote;
  readonly loading = this.quoteService.loading;

  readonly QuoteStatus = QuoteStatus;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.quoteService.loadById(id).subscribe({
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar el presupuesto. Es posible que no exista.',
            life: 5000,
          });
          this.router.navigate(['/quotes']);
        },
      });
    }
  }

  onBack(): void {
    this.router.navigate(['/quotes']);
  }

  onEdit(): void {
    const id = this.quote()?.id;
    if (id) this.router.navigate(['/quotes', id, 'edit']);
  }

  getStatusLabel(status: QuoteStatus): string {
    return getQuoteStatusLabel(status);
  }

  getStatusVariant(status: QuoteStatus): 'success' | 'warning' | 'danger' | 'label' {
    const variants: Record<QuoteStatus, 'success' | 'warning' | 'danger' | 'label'> = {
      [QuoteStatus.DRAFT]: 'label',
      [QuoteStatus.CANCELLED]: 'danger',
      [QuoteStatus.CONVERTED_TO_ORDER]: 'success',
      [QuoteStatus.CONVERTED_TO_INVOICE]: 'success',
    };
    return variants[status] ?? 'label';
  }
}
