import { inject, Injectable } from '@angular/core';
import { AuthService } from '../../services/application/auth-application.service';
import { BusinessModule } from '../../user/models/enums/business-module.enum';
import { PermissionAction } from '../models/access.model';
@Injectable({ providedIn: 'root' })
export class AuthorizationService {
  private readonly auth = inject(AuthService);
  can(module: BusinessModule, action: PermissionAction = 'READ'): boolean {
    return this.auth.hasPermission(module, action);
  }
}
