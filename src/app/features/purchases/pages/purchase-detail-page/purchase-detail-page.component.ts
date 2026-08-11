import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';
import {
  DetailsCardComponent,
  DetailsCardHeaderComponent,
  DetailsInfoFieldComponent,
  DetailsInfoGridComponent,
  DetailsSectionCardComponent,
} from '@shared/components/details';
import {
  EmptyStateComponent,
  LoadingSpinnerComponent,
  PageHeaderComponent,
  TextBadgeComponent,
} from '@shared/components/ui';
import { PurchaseApplicationService } from '@features/purchases/services/application/purchase-application.service';
import { PurchaseStatus, getPurchaseStatusLabel } from '@features/purchases/models/enums/purchase-status.enum';

@Component({
  selector: 'app-purchase-detail-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    DecimalPipe,
    ButtonModule,
    TableModule,
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
  templateUrl: './purchase-detail-page.component.html',
})
export class PurchaseDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly purchaseService = inject(PurchaseApplicationService);
  private readonly messageService = inject(MessageService);

  readonly purchase = this.purchaseService.currentPurchase;
  readonly loading = this.purchaseService.loading;

  readonly PurchaseStatus = PurchaseStatus;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.purchaseService.loadById(id).subscribe({
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar la compra. Es posible que no exista.',
            life: 5000,
          });
          this.router.navigate(['/purchases']);
        },
      });
    }
  }

  onBack(): void {
    this.router.navigate(['/purchases']);
  }

  onEdit(): void {
    const id = this.purchase()?.id;
    if (id) this.router.navigate(['/purchases', id, 'edit']);
  }

  getStatusLabel(status: PurchaseStatus): string {
    return getPurchaseStatusLabel(status);
  }

  getStatusVariant(status: PurchaseStatus): 'success' | 'danger' | 'label' {
    const variants: Record<PurchaseStatus, 'success' | 'danger' | 'label'> = {
      [PurchaseStatus.DRAFT]: 'label',
      [PurchaseStatus.CONFIRMED]: 'success',
      [PurchaseStatus.CANCELLED]: 'danger',
    };
    return variants[status] ?? 'label';
  }
}
