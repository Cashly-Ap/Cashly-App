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
import { MessageService } from 'primeng/api';
import { CustomerApplicationService } from '@features/customers/services/application';
import { CustomerDetails } from '@features/customers/models/interfaces';
import { getCustomerTypeLabel } from '@features/customers/models/enums';

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
  ],
  templateUrl: './customers-details-page.component.html',
  providers: [MessageService],
})
export class CustomersDetailsPageComponent implements OnInit {
  private service = inject(CustomerApplicationService);
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
    }
  }

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

  getInitials(): string {
    const name = this.customer()?.legalName || '';
    return name.charAt(0).toUpperCase();
  }
}
