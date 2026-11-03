import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ModuleNavigatorComponent } from '@core/shortcuts/module-navigator.component';

describe('ModuleNavigatorComponent', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [ModuleNavigatorComponent],
      providers: [provideRouter([])],
    }),
  );
  it('lists only supplied authorized destinations and supports filtering', () => {
    const fixture = TestBed.createComponent(ModuleNavigatorComponent);
    fixture.componentRef.setInput('items', [
      {
        label: 'Ventas',
        icon: 'pi pi-briefcase',
        children: [{ label: 'Pedidos', icon: 'pi pi-shopping-cart', routerLink: '/sales/orders' }],
      },
    ]);
    expect(fixture.componentInstance.destinations().map((item) => item.route)).toEqual([
      '/sales/orders',
    ]);
    fixture.componentInstance.query.set('usuarios');
    expect(fixture.componentInstance.destinations()).toEqual([]);
    fixture.componentInstance.query.set('ped');
    expect(fixture.componentInstance.destinations()).toHaveLength(1);
  });
  it('opens a fresh query and navigates only to current destinations', () => {
    const fixture = TestBed.createComponent(ModuleNavigatorComponent);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    fixture.componentRef.setInput('items', [
      { label: 'Pedidos', icon: 'pi', routerLink: '/sales/orders' },
    ]);
    fixture.componentInstance.query.set('old');
    fixture.componentInstance.open();
    expect(fixture.componentInstance.query()).toBe('');
    expect(fixture.componentInstance.visible()).toBe(true);
    fixture.componentInstance.navigate(fixture.componentInstance.destinations()[0]);
    expect(navigate).toHaveBeenCalledWith('/sales/orders');
    fixture.componentRef.setInput('items', []);
    fixture.componentInstance.navigate({
      label: 'Usuarios',
      icon: 'pi',
      route: '/platform/users',
      group: 'Plataforma',
    });
    expect(navigate).toHaveBeenCalledTimes(1);
  });
  it('selects filtered destinations with arrows or J/K and opens only the active result', () => {
    const fixture = TestBed.createComponent(ModuleNavigatorComponent);
    fixture.componentRef.setInput('items', [
      { label: 'Usuarios', icon: 'pi', routerLink: '/platform/users' },
      { label: 'Roles', icon: 'pi', routerLink: '/platform/roles' },
    ]);
    const component = fixture.componentInstance;
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const field = document.createElement('input');
    const press = (code: string, target: HTMLElement) => {
      const event = new KeyboardEvent('keydown', { code, bubbles: true, cancelable: true });
      target.addEventListener('keydown', (event) => component.onKeydown(event), { once: true });
      target.dispatchEvent(event);
    };
    press('KeyJ', field);
    expect(component.activeIndex()).toBe(-1);
    press('ArrowDown', field);
    expect(component.activeIndex()).toBe(0);
    press('ArrowDown', field);
    expect(component.activeIndex()).toBe(1);
    press('KeyK', document.body);
    expect(component.activeIndex()).toBe(0);
    press('KeyJ', document.body);
    expect(component.activeIndex()).toBe(1);
    press('Enter', document.body);
    expect(navigate).toHaveBeenCalledWith('/platform/roles');
    component.query.set('missing');
    press('ArrowDown', field);
    press('Enter', field);
    expect(navigate).toHaveBeenCalledTimes(1);
  });
});
