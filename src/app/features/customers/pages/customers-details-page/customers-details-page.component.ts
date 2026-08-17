import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import {
  DetailActionsMenuComponent,
  DetailsCardComponent,
  DetailsCardHeaderComponent,
  DetailsInfoFieldComponent,
  DetailsInfoGridComponent,
} from '@shared/components/details';
import { LoadingSpinnerComponent } from '@shared/components/ui/loading-spinner/loading-spinner.component';
import { PageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';
import { StatusBadgeComponent } from '@shared/components/ui/status-badge/status-badge.component';
import { TextBadgeComponent } from '@shared/components/ui/text-badge/text-badge.component';
import { MessageService } from 'primeng/api';
import { AuthService } from '@features/auth/services/application/auth-application.service';
import { BusinessModule } from '@features/users/models/enums';
import { CustomerApplicationService } from '@features/customers/services/application';
import { CustomerApiService } from '@features/customers/services/api/customer-api.service';
import {
  CustomerDetails,
  CustomerWarehouseAccessItem,
} from '@features/customers/models/interfaces';
import { getCustomerTypeLabel } from '@features/customers/models/enums';
import { PriceTypeApplicationService } from '@features/price-types/services/application/price-type-application.service';
import { ChangePortalPasswordDialogComponent } from '@features/customers/components';

@Component({
  selector: 'app-customers-details-page',
  standalone: true,
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
    TextBadgeComponent,
    ChangePortalPasswordDialogComponent,
  ],
  templateUrl: './customers-details-page.component.html',
})
export class CustomersDetailsPageComponent implements OnInit {
  private service = inject(CustomerApplicationService);
  private customerApi = inject(CustomerApiService);
  private priceTypeService = inject(PriceTypeApplicationService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);

  customer = signal<CustomerDetails | null>(null);
  loading = signal(false);
  showPasswordDialog = signal(false);

  warehouseAccess = signal<CustomerWarehouseAccessItem[]>([]);
  warehouseAccessLoading = signal(false);

  showBalance = computed(() => {
    return this.authService.hasModulePermission(BusinessModule.FINANCE);
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCustomer(id);
      this.loadWarehouseAccess(id);
    }
    this.priceTypeService.loadAll().subscribe();
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
        this.router.navigate(['/customers']);
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
      this.router.navigate(['/customers', id, 'balance']);
    }
  }

  onEdit(): void {
    const id = this.customer()?.id;
    if (id) {
      this.router.navigate(['/customers', id, 'edit']);
    }
  }

  onBack(): void {
    this.router.navigate(['/customers']);
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
