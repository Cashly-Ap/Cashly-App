import { LocalizedDatePipe } from '@core/i18n/localized-format.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { NavigationHistoryService } from '@core/navigation/navigation-history.service';
import { PermissionDirective } from '@features/platform/auth/authorization/directives/permission.directive';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DetailActionsMenuComponent } from '@shared/components/details/detail-actions-menu/detail-actions-menu.component';

import { DetailsCardHeaderComponent } from '@shared/components/details/details-card-header/details-card-header.component';
import { DetailsInfoFieldComponent } from '@shared/components/details/details-info-field/details-info-field.component';
import { DetailsInfoGridComponent } from '@shared/components/details/details-info-grid/details-info-grid.component';
import { LoadingSpinnerComponent } from '@shared/components/ui/loading-spinner/loading-spinner.component';
import { PageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';
import { StatusBadgeComponent } from '@shared/components/ui/status-badge/status-badge.component';
import { TextBadgeComponent } from '@shared/components/ui/text-badge/text-badge.component';
import { MessageService } from 'primeng/api';
import { SupplierApplicationService } from '@features/partners/suppliers/services/application/supplier-application.service';
import { SupplierDetails } from '@features/partners/suppliers/models/interfaces/supplier-details.interface';
import { getSupplierTypeLabel } from '@features/partners/suppliers/models/enums/supplier-type.enum';

import { PanelCardComponent } from '@shared/components/ui/panel-card/panel-card.component';
@Component({
  selector: 'app-suppliers-details-page',
  standalone: true,
  imports: [
    PanelCardComponent,
    TranslatePipe,
    LocalizedDatePipe,
    PermissionDirective,
    CommonModule,
    ButtonModule,
    DetailActionsMenuComponent,
    DetailsCardHeaderComponent,
    DetailsInfoFieldComponent,
    DetailsInfoGridComponent,
    LoadingSpinnerComponent,
    PageHeaderComponent,
    StatusBadgeComponent,
    TextBadgeComponent,
  ],
  templateUrl: './suppliers-details-page.component.html',
})
export class SuppliersDetailsPageComponent implements OnInit {
  private readonly navigationHistory = inject(NavigationHistoryService);
  private service = inject(SupplierApplicationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);

  supplier = signal<SupplierDetails | null>(null);
  loading = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadSupplier(id);
    }
  }

  private loadSupplier(id: string): void {
    this.loading.set(true);
    this.service.loadById(id).subscribe({
      next: (supplier) => {
        this.supplier.set(supplier);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar el proveedor. Es posible que no exista.',
          life: 5000,
        });
        this.router.navigate(['/partners/suppliers']);
      },
    });
  }

  onEdit(): void {
    const id = this.supplier()?.id;
    if (id) {
      this.router.navigate(['/partners/suppliers', id, 'edit']);
    }
  }

  onBack(): void {
    this.navigationHistory.back(['/partners/suppliers']);
  }

  getTypeLabel(type: string): string {
    return getSupplierTypeLabel(type as Parameters<typeof getSupplierTypeLabel>[0]);
  }

  getAddressLocation(
    state: string | undefined,
    municipality: string | undefined,
    postalCode: string | undefined,
  ): string {
    return [state, municipality, postalCode].filter((v): v is string => !!v).join(' · ');
  }
}
