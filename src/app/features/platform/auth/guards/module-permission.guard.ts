import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '@features/platform/auth/services/application/auth-application.service';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';

export const modulePermissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/platform/auth/login']);
    return false;
  }

  const module = route.data['module'] as BusinessModule;

  if (!module) {
    return true;
  }

  if (authService.hasModulePermission(module)) {
    return true;
  }

  router.navigate(['/']);
  return false;
};
