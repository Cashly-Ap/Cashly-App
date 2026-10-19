import { Directive, effect, ElementRef, inject, input, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { AuthorizationService } from '../services/authorization.service';
import { BusinessModule } from '../../user/models/enums/business-module.enum';
import { PermissionAction } from '../models/access.model';
import { moduleForUrl } from '../models/permission-context';

@Directive({ selector: '[appPermission]', standalone: true })
export class PermissionDirective {
  readonly appRequiredPermissions = input<string[]>([]);
  readonly appPermissionModule = input<BusinessModule | string | null>(null);
  readonly appPermission = input.required<PermissionAction>();

  private readonly authorization = inject(AuthorizationService);
  private readonly router = inject(Router);
  private readonly element = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);

  constructor() {
    effect(() => {
      const module =
        (this.appPermissionModule() as BusinessModule | null) ?? moduleForUrl(this.router.url);
      const selfService = this.router.url.startsWith('/platform/auth');
      const extraGrants = this.appRequiredPermissions().every((grant) => {
        const [owner, action] = grant.split(':');
        return this.authorization.can(owner as BusinessModule, action as PermissionAction);
      });
      const reportGrant =
        this.appPermission() !== 'EXPORT' ||
        this.authorization.can(BusinessModule.DOCUMENT_ADMIN, 'EXPORT');
      const allowed = module
        ? this.authorization.can(module, this.appPermission()) && extraGrants && reportGrant
        : selfService;
      this.renderer.setStyle(this.element.nativeElement, 'display', allowed ? null : 'none');
    });
  }
}
