import {
  computed,
  DestroyRef,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  Renderer2,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthorizationService } from '@features/platform/auth/authorization/services/authorization.service';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';
import { PermissionAction } from '@features/platform/auth/authorization/models/access.model';
import { AppPermission } from '@features/platform/auth/permissions/app-permission';
import { moduleForUrl } from '@features/platform/auth/authorization/models/permission-context';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';

@Directive({ selector: '[appPermission], [appPermissionCode]', standalone: true })
export class PermissionDirective {
  readonly appRequiredPermissions = input<string[]>([]);
  readonly appPermissionModule = input<BusinessModule | string | null>(null);
  readonly appPermission = input<PermissionAction | null>(null);
  readonly appPermissionCode = input<AppPermission | null>(null);

  private readonly authorization = inject(AuthorizationService);
  private readonly router = inject(Router);
  private readonly element = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );
  readonly allowed = computed(() => {
    const code = this.appPermissionCode();
    const action = this.appPermission();
    if (!code && !action) return true;
    const extraGrants = this.appRequiredPermissions().every((grant) => {
      const [owner, required] = grant.split(':');
      return this.authorization.can(owner as BusinessModule, required as PermissionAction);
    });
    if (code) return this.authorization.can(code) && extraGrants;
    const module =
      (this.appPermissionModule() as BusinessModule | null) ?? moduleForUrl(this.currentUrl());
    const selfService = this.currentUrl().startsWith('/platform/auth');
    return module
      ? this.authorization.can(module, action!) && extraGrants
      : selfService && extraGrants;
  });

  constructor() {
    effect(() => {
      const allowed = this.allowed();
      this.renderer.setStyle(this.element.nativeElement, 'display', allowed ? null : 'none');
      if (allowed) this.renderer.removeAttribute(this.element.nativeElement, 'aria-hidden');
      else this.renderer.setAttribute(this.element.nativeElement, 'aria-hidden', 'true');
    });
    const stopDeniedAction = (event: Event) => {
      if (this.allowed()) return;
      event.preventDefault();
      event.stopImmediatePropagation();
    };
    const listeners = ['click', 'keydown', 'submit'].map((event) =>
      this.renderer.listen(this.element.nativeElement, event, stopDeniedAction, { capture: true }),
    );
    inject(DestroyRef).onDestroy(() => listeners.forEach((dispose) => dispose()));
  }
}
