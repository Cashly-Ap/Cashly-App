import { Component, inject, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { AvatarModule } from 'primeng/avatar';
import { MainLayoutComponent } from '@core/layouts/main-layout.component';
import { AuthService } from '@features/auth/services';
import { UserType } from '@features/auth/models';

@Component({
  selector: 'app-configuration-page',
  standalone: true,
  imports: [
    CommonModule,
    MainLayoutComponent,
    CardModule,
    ButtonModule,
    DividerModule,
    AvatarModule,
  ],
  templateUrl: './configuration-page.component.html',
  providers: [DecimalPipe],
})
export class ConfigurationPageComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  private decimalPipe = inject(DecimalPipe);

  currentUser = this.authService.currentUser;

  commissionDeductionLabel = computed(() => {
    const value = this.currentUser()?.commissionDeductionPercentage ?? 0;
    const formatted = this.decimalPipe.transform(value, '1.2-2');
    return `Cambiar Deducible Mensual de Retraso (${formatted}%)`;
  });

  getInitials(): string {
    const displayName = this.currentUser()?.displayName || '';
    return displayName.charAt(0).toUpperCase();
  }

  getUserTypeLabel(type: UserType): string {
    const labels: Record<UserType, string> = {
      USER: 'Usuario',
      MERCHANT: 'Vendedor',
      ADMIN: 'Administrador',
      DISPATCHER: 'Despachador',
    };
    return labels[type] || type;
  }

  onEditName(): void {
    this.router.navigate(['/auth/change-username']);
  }

  onChangePassword(): void {
    this.router.navigate(['/auth/change-password']);
  }

  onChangeCommissionDeduction(): void {
    this.router.navigate(['/auth/change-commission-deduction']);
  }
}


