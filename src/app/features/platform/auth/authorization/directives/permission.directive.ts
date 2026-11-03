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
import { AuthorizationService } from '../services/authorization.service';
import { BusinessModule } from '../../user/models/enums/business-module.enum';
import { PermissionAction } from '../models/access.model';
import { moduleForUrl } from '../models/permission-context';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';

@Directive({ selector: '[appPermission]', standalone: true })
export class PermissionDirective {
  readonly appRequiredPermissions = input<string[]>([]);
  readonly appPermissionModule = input<BusinessModule | string | null>(null);
  readonly appPermission = input<PermissionAction | null>(null);

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
    const action = this.appPermission();
    if (!action) return true;
    const module =
      (this.appPermissionModule() as BusinessModule | null) ?? moduleForUrl(this.currentUrl());
    const selfService = this.currentUrl().startsWith('/platform/auth');
    const extraGrants = this.appRequiredPermissions().every((grant) => {
      const [owner, action] = grant.split(':');
      return this.authorization.can(owner as BusinessModule, action as PermissionAction);
    });
    return module ? this.authorization.can(module, action) && extraGrants : selfService;
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
