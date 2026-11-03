import { LocalizedDatePipe, LocalizedNumberPipe } from '@core/i18n/localized-format.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { NavigationHistoryService } from '@core/navigation/navigation-history.service';
import { DeleteDialogService } from '@shared/services/delete-dialog.service';
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
import { AuthService } from '@features/platform/auth/services/application/auth-application.service';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';
import { CustomerApplicationService } from '@features/partners/customers/services/application/customer-application.service';
import { CustomerApiService } from '@features/partners/customers/services/api/customer-api.service';
import { CustomerDetails } from '@features/partners/customers/models/interfaces/customer-details.interface';
import { CustomerWarehouseAccessItem } from '@features/partners/customers/models/interfaces/customer-warehouse-access.interface';
import { getCustomerTypeLabel } from '@features/partners/customers/models/enums/customer-type.enum';
import { PriceTypeApplicationService } from '@features/catalog/price-types/services/application/price-type-application.service';

import { PanelCardComponent } from '@shared/components/ui/panel-card/panel-card.component';
import { BackButtonComponent } from '@shared/components/ui/back-button/back-button.component';
@Component({
  selector: 'app-customers-details-page',
  standalone: true,
  imports: [
    BackButtonComponent,
    PanelCardComponent,
    TranslatePipe,
    LocalizedDatePipe,
    LocalizedNumberPipe,
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
  templateUrl: './customers-details-page.component.html',
})
export class CustomersDetailsPageComponent implements OnInit {
  private readonly navigationHistory = inject(NavigationHistoryService);
  private service = inject(CustomerApplicationService);
  private customerApi = inject(CustomerApiService);
  private priceTypeService = inject(PriceTypeApplicationService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private readonly deletion = inject(DeleteDialogService);

  customer = signal<CustomerDetails | null>(null);
  loading = signal(false);

  warehouseAccess = signal<CustomerWarehouseAccessItem[]>([]);
  warehouseAccessLoading = signal(false);

  showBalance = computed(() => {
    return this.authService.hasModulePermission(BusinessModule.CONTACTS_CUSTOMERS);
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCustomer(id);
      this.loadWarehouseAccess(id);
    }
    this.priceTypeService.loadAll({ size: 1000 }).subscribe();
  }

  priceTypeName = computed(() => {
    const priceTypeId = this.customer()?.priceTypeId;
    if (!priceTypeId) return null;
    return this.priceTypeService.priceTypes().find((pt) => pt.id === priceTypeId)?.name ?? null;
  });

  private loadCustomer(id: string): void {
    this.loading.set(true);
    this.service.loadById(id).subscribe({
      next: (customer) => {
        this.customer.set(customer);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar el cliente. Es posible que no exista.',
          life: 5000,
        });
        this.router.navigate(['/partners/customers']);
      },
    });
  }

  private loadWarehouseAccess(id: string): void {
    this.warehouseAccessLoading.set(true);
    this.customerApi.getWarehouseAccess(id).subscribe({
      next: (res) => {
        this.warehouseAccess.set(res);
        this.warehouseAccessLoading.set(false);
      },
      error: () => this.warehouseAccessLoading.set(false),
    });
  }

  onViewBalance(): void {
    const id = this.customer()?.id;
    if (id) {
      this.router.navigate(['/partners/customers', id, 'balance']);
    }
  }

  onEdit(): void {
    const id = this.customer()?.id;
    if (id) {
      this.router.navigate(['/partners/customers', id, 'edit']);
    }
  }

  onDelete(): void {
    const item = this.customer();
    if (!item) return;
    this.deletion.open('customers', item.id, item.legalName, () => this.router.navigate(['/partners/customers']));
  }

  onBack(): void {
    this.navigationHistory.back(['/partners/customers']);
  }

  getTypeLabel(type: string): string {
    return getCustomerTypeLabel(type as Parameters<typeof getCustomerTypeLabel>[0]);
  }

  getAddressLocation(
    state: string | undefined,
    municipality: string | undefined,
    postalCode: string | undefined,
  ): string {
    return [state, municipality, postalCode].filter((v): v is string => !!v).join(' · ');
  }
}
