import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
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
})
export class ConfigurationPageComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  currentUser = this.authService.currentUser;

  getInitials(): string {
    const displayName = this.currentUser()?.displayName || '';
    return displayName.charAt(0).toUpperCase();
  }

  getUserTypeLabel(type: UserType): string {
    const labels: Record<UserType, string> = {
      CUSTOMER: 'Clientes',
      OPERATOR: 'Operadores',
      ADMINISTRATION: 'Administración',
      SUPER_ADMIN: 'Super Admin',
    };
    return labels[type] || type;
  }

  onEditName(): void {
    this.router.navigate(['/auth/change-username']);
  }

  onChangePassword(): void {
    this.router.navigate(['/auth/change-password']);
  }
}


