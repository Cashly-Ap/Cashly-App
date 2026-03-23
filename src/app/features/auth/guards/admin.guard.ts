import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@features/auth/services';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/auth/login']);
    return false;
  }

  if (authService.isMerchant()) {
    router.navigate(['/orders']);
    return false;
  }

  if (authService.isDispatcher()) {
    router.navigate(['/invoices']);
    return false;
  }

  return true;
};
