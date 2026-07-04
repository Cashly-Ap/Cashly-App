import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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
    AvatarModule,
  ],
  templateUrl: './configuration-page.component.html',
})
export class ConfigurationPageComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  currentUser = this.authService.currentUser;

  getInitials(): string {
    const userName = this.currentUser()?.userName || '';
    return userName.charAt(0).toUpperCase();
  }

  getUserTypeLabel(type: UserType): string {
    const labels: Record<UserType, string> = {
      OPERATOR: 'Operador',
      ADMIN: 'Administrador',
      SUPER_ADMIN: 'Super Administrador',
    };
    return labels[type] ?? type;
  }

  onEditName(): void {
    this.router.navigate(['/auth/change-username']);
  }

  onChangePassword(): void {
    this.router.navigate(['/auth/change-password']);
  }
}


