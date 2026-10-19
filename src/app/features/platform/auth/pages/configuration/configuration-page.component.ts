import { PermissionDirective } from '@features/platform/auth/authorization/directives/permission.directive';
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { AuthService } from '@features/platform/auth/services/application/auth-application.service';
import { UserType } from '@features/platform/auth/models/interfaces/user.interface';

@Component({
  selector: 'app-configuration-page',
  standalone: true,
  imports: [PermissionDirective, CommonModule, AvatarModule],
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
    this.router.navigate(['/platform/auth/change-username']);
  }

  onChangePassword(): void {
    this.router.navigate(['/platform/auth/change-password']);
  }
}
