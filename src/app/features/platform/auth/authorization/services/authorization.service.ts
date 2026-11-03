import { inject, Injectable } from '@angular/core';
import { AuthService } from '@features/platform/auth/services/application/auth-application.service';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';
import { PermissionAction } from '@features/platform/auth/authorization/models/access.model';
import { AppPermission } from '@features/platform/auth/permissions/app-permission';

@Injectable({ providedIn: 'root' })
export class AuthorizationService {
  private readonly auth = inject(AuthService);

  can(permission: AppPermission): boolean;
  can(module: BusinessModule, action?: PermissionAction): boolean;
  can(moduleOrPermission: BusinessModule | AppPermission, action?: PermissionAction): boolean {
    if (action) {
      return this.auth.hasPermission(moduleOrPermission as BusinessModule, action);
    }
    if (Object.values(BusinessModule).includes(moduleOrPermission as BusinessModule)) {
      return this.auth.hasPermission(moduleOrPermission as BusinessModule, 'READ');
    }
    return this.auth.hasPermissionCode(moduleOrPermission);
  }
}
