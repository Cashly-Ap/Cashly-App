import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';
import { PermissionDirective } from '@features/platform/auth/authorization/directives/permission.directive';
import { AuthorizationService } from '@features/platform/auth/authorization/services/authorization.service';
import { PermissionAction } from '@features/platform/auth/authorization/models/access.model';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';
import { DetailActionsMenuComponent } from '@shared/components/details/detail-actions-menu/detail-actions-menu.component';

@Component({
  standalone: true,
  imports: [DetailActionsMenuComponent, PermissionDirective],
  template: `
    <app-detail-actions-menu>
      <div><button [appPermission]="action()">Projected action</button></div>
    </app-detail-actions-menu>
  `,
})
class ActionsHost {
  readonly action = signal<PermissionAction>('UPDATE');
}

describe('DetailActionsMenuComponent', () => {
  let fixture: ComponentFixture<ActionsHost>;
  let events: Subject<NavigationEnd>;
  const grants = signal<string[]>([]);

  beforeEach(() => {
    grants.set(['CATALOG_PRODUCTS:READ']);
    events = new Subject<NavigationEnd>();
    TestBed.configureTestingModule({
      imports: [ActionsHost],
      providers: [
        { provide: Router, useValue: { url: '/catalog/products/item', events } },
        {
          provide: AuthorizationService,
          useValue: {
            can: (module: BusinessModule, action: PermissionAction) =>
              grants().includes(`${module}:${action}`),
          },
        },
      ],
    });
    fixture = TestBed.createComponent(ActionsHost);
    fixture.detectChanges();
  });

  function trigger(): HTMLElement | null {
    return fixture.nativeElement.querySelector('app-detail-actions-menu > p-button');
  }

  it('hides the trigger when a reader cannot perform any projected action', () => {
    expect(trigger()).toBeNull();
    expect(fixture.nativeElement.querySelector('p-popover')).not.toBeNull();
  });

  it('renders the labeled trigger for an allowed projected action', () => {
    grants.set(['CATALOG_PRODUCTS:READ', 'CATALOG_PRODUCTS:UPDATE']);
    fixture.detectChanges();
    expect(trigger()?.querySelector('button')?.textContent?.trim()).toBe('Acciones');
  });

  it('supports projected read actions for a reader', () => {
    fixture.componentInstance.action.set('READ');
    fixture.detectChanges();
    expect(trigger()).not.toBeNull();
  });

  it('hides and restores the trigger when the last permitted action changes', () => {
    grants.set(['CATALOG_PRODUCTS:READ', 'CATALOG_PRODUCTS:UPDATE']);
    fixture.detectChanges();
    expect(trigger()).not.toBeNull();
    grants.set(['CATALOG_PRODUCTS:READ']);
    fixture.detectChanges();
    expect(trigger()).toBeNull();
    grants.set(['CATALOG_PRODUCTS:READ', 'CATALOG_PRODUCTS:UPDATE']);
    fixture.detectChanges();
    expect(trigger()).not.toBeNull();
  });

  it('rechecks projected actions after navigation reuses the component', () => {
    grants.set(['CATALOG_PRODUCTS:READ', 'CATALOG_PRODUCTS:UPDATE']);
    fixture.detectChanges();
    expect(trigger()).not.toBeNull();
    events.next(new NavigationEnd(1, '/sales/orders/item', '/sales/orders/item'));
    fixture.detectChanges();
    expect(trigger()).toBeNull();
    grants.set(['SALES_ORDERS:READ', 'SALES_ORDERS:UPDATE']);
    fixture.detectChanges();
    expect(trigger()).not.toBeNull();
  });
});
