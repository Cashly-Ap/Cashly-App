import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MainLayoutComponent } from '@core/layouts/main-layout.component';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import {
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
import { CustomerApplicationService } from '@features/customers/services/application';
import { CustomerApiService } from '@features/customers/services/api/customer-api.service';
import { CustomerDetails, CustomerWarehouseAccessItem } from '@features/customers/models/interfaces';
import { getCustomerTypeLabel } from '@features/customers/models/enums';
import { PriceTypeApplicationService } from '@features/price-types/services/application/price-type-application.service';

@Component({
  selector: 'app-customers-details-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MainLayoutComponent,
    ButtonModule,
    DialogModule,
    InputTextModule,
    DetailsCardComponent,
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
  private service = inject(CustomerApplicationService);
  private customerApi = inject(CustomerApiService);
  private priceTypeService = inject(PriceTypeApplicationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);

  customer = signal<CustomerDetails | null>(null);
  loading = signal(false);
  showPasswordDialog = signal(false);
  newPassword = signal('');
  confirmPassword = signal('');
  changePasswordLoading = signal(false);

  passwordTouched = signal(false);
  confirmPasswordTouched = signal(false);

  warehouseAccess = signal<CustomerWarehouseAccessItem[]>([]);
  warehouseAccessLoading = signal(false);

  passwordError = computed(() => {
    const value = this.newPassword();
    if (!value) return 'La contraseña es requerida';
    if (value.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
    if (!/[A-Z]/.test(value)) return 'La contraseña debe contener: letra mayúscula';
    if (!/[a-z]/.test(value)) return 'La contraseña debe contener: letra minúscula';
    if (!/[0-9]/.test(value)) return 'La contraseña debe contener: número';
    return '';
  });

  confirmPasswordError = computed(() => {
    const confirm = this.confirmPassword();
    if (!confirm) return 'La confirmación de contraseña es requerida';
    if (confirm !== this.newPassword()) return 'Las contraseñas no coinciden';
    return '';
  });

  isPasswordFormValid = computed(
    () => !this.passwordError() && !this.confirmPasswordError(),
  );

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

  onEdit(): void {
    const id = this.customer()?.id;
    if (id) {
      this.router.navigate(['/customers', id, 'edit']);
    }
  }

  onBack(): void {
    this.router.navigate(['/customers']);
  }

  onChangePortalPassword(): void {
    this.passwordTouched.set(true);
    this.confirmPasswordTouched.set(true);

    if (!this.isPasswordFormValid()) return;

    const id = this.customer()?.id;
    if (!id) return;

    this.changePasswordLoading.set(true);
    this.service.changePortalPassword(id, this.newPassword()).subscribe({
      next: () => {
        this.changePasswordLoading.set(false);
        this.showPasswordDialog.set(false);
        this.resetPasswordDialog();
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Contraseña del portal actualizada exitosamente',
          life: 3000,
        });
      },
      error: () => {
        this.changePasswordLoading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cambiar la contraseña. Por favor, intente nuevamente.',
          life: 5000,
        });
      },
    });
  }

  resetPasswordDialog(): void {
    this.newPassword.set('');
    this.confirmPassword.set('');
    this.passwordTouched.set(false);
    this.confirmPasswordTouched.set(false);
  }

  getTypeLabel(type: string): string {
    return getCustomerTypeLabel(type as Parameters<typeof getCustomerTypeLabel>[0]);
  }

  getAddressLocation(state: string | undefined, municipality: string | undefined, postalCode: string | undefined): string {
    return [state, municipality, postalCode].filter((v): v is string => !!v).join(' · ');
  }
}
