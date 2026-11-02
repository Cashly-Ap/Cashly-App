import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PermissionDirective } from './permission.directive';
import { AuthorizationService } from '../services/authorization.service';
import { BusinessModule } from '../../user/models/enums/business-module.enum';

@Component({
  standalone: true,
  imports: [PermissionDirective],
  template: '<button appPermission="UPDATE" (click)="edit()">Edit</button>',
})
class PermissionHost {
  readonly edit = vi.fn();
}

describe('PermissionDirective', () => {
  const grants = signal<string[]>([]);
  let events: Subject<NavigationEnd>;

  beforeEach(() => {
    grants.set(['CATALOG_PRODUCTS:UPDATE']);
    events = new Subject<NavigationEnd>();
    TestBed.configureTestingModule({
      imports: [PermissionHost],
      providers: [
        { provide: Router, useValue: { url: '/catalog/products', events } },
        {
          provide: AuthorizationService,
          useValue: {
            can: (module: BusinessModule, action: string) =>
              grants().includes(`${module}:${action}`),
          },
        },
      ],
    });
  });

  it('hides denied actions and blocks dispatched clicks before the handler runs', () => {
    grants.set([]);
    const fixture = TestBed.createComponent(PermissionHost);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(button.style.display).toBe('none');
    expect(button.getAttribute('aria-hidden')).toBe('true');
    expect(fixture.componentInstance.edit).not.toHaveBeenCalled();
  });

  it('checks the current grant immediately when an existing page loses access', () => {
    const fixture = TestBed.createComponent(PermissionHost);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();
    expect(fixture.componentInstance.edit).toHaveBeenCalledTimes(1);
    grants.set([]);
    button.click();
    expect(fixture.componentInstance.edit).toHaveBeenCalledTimes(1);
    fixture.detectChanges();
    expect(button.style.display).toBe('none');
    grants.set(['CATALOG_PRODUCTS:UPDATE']);
    fixture.detectChanges();
    expect(button.style.display).toBe('');
    expect(button.hasAttribute('aria-hidden')).toBe(false);
  });

  it('recalculates the owner when navigation reuses the same component', () => {
    const fixture = TestBed.createComponent(PermissionHost);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.style.display).toBe('');
    events.next(new NavigationEnd(1, '/finance/billing/invoices', '/finance/billing/invoices'));
    fixture.detectChanges();
    expect(button.style.display).toBe('none');
    grants.set([`${BusinessModule.FINANCE_INVOICES}:UPDATE`]);
    fixture.detectChanges();
    expect(button.style.display).toBe('');
  });

  it('blocks keyboard and submit events while access is denied', () => {
    grants.set([]);
    const fixture = TestBed.createComponent(PermissionHost);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    for (const name of ['keydown', 'submit']) {
      const event = new Event(name, { bubbles: true, cancelable: true });
      expect(button.dispatchEvent(event)).toBe(false);
      expect(event.defaultPrevented).toBe(true);
    }
  });
});
