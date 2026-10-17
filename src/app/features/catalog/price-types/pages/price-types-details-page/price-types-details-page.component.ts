import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { DetailActionsMenuComponent } from '@shared/components/details/detail-actions-menu/detail-actions-menu.component';
import { DetailsCardComponent } from '@shared/components/details/details-card/details-card.component';
import { DetailsCardHeaderComponent } from '@shared/components/details/details-card-header/details-card-header.component';
import { DetailsInfoFieldComponent } from '@shared/components/details/details-info-field/details-info-field.component';
import { DetailsInfoGridComponent } from '@shared/components/details/details-info-grid/details-info-grid.component';
import { LoadingSpinnerComponent } from '@shared/components/ui/loading-spinner/loading-spinner.component';
import { PageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';
import { StatusBadgeComponent } from '@shared/components/ui/status-badge/status-badge.component';
import { PriceTypeApplicationService } from '@features/catalog/price-types/services/application/price-type-application.service';
import { PriceTypeDetails } from '@features/catalog/price-types/models/interfaces/price-type-details.interface';

@Component({
  selector: 'app-price-types-details-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ButtonModule,
    DetailActionsMenuComponent,
    DetailsCardComponent,
    DetailsCardHeaderComponent,
    DetailsInfoFieldComponent,
    DetailsInfoGridComponent,
    LoadingSpinnerComponent,
    PageHeaderComponent,
    StatusBadgeComponent,
  ],
  templateUrl: './price-types-details-page.component.html',
})
export class PriceTypesDetailsPageComponent implements OnInit {
  private service = inject(PriceTypeApplicationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);

  priceType = signal<PriceTypeDetails | null>(null);
  loading = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPriceType(id);
    }
  }

  private loadPriceType(id: string): void {
    this.loading.set(true);
    this.service.loadById(id).subscribe({
      next: (priceType) => {
        this.priceType.set(priceType);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar el tipo de precio.',
          life: 5000,
        });
        this.router.navigate(['/catalog/price-types']);
      },
    });
  }

  onEdit(): void {
    const id = this.priceType()?.id;
    if (id) {
      this.router.navigate(['/catalog/price-types', id, 'edit']);
    }
  }

  onBack(): void {
    this.router.navigate(['/catalog/price-types']);
  }
}
