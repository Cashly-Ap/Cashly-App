import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { signal } from '@angular/core';
import { of, Subject, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfigurationPageComponent } from '@features/platform/auth/pages/configuration/configuration-page.component';
import { AuthService } from '@features/platform/auth/services/application/auth-application.service';
import { SelfProfileService } from '@features/platform/auth/services/api/self-profile.service';
import { UserDetails } from '@features/platform/auth/user/models/interfaces/user-details.interface';
import { CurrentAccess } from '@features/platform/auth/authorization/models/access.model';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';
const profile: UserDetails = {
  id: 'private-account-id',
  firstName: 'Ana',
  lastName: 'García',
  userName: 'ana',
  email: 'ana@example.com',
  phone: '600123456',
  address: {
    street: 'Calle 1',
    city: 'Madrid',
    region: 'Madrid',
    postalCode: '28001',
    country: 'España',
  },
  roleId: 'role-1',
  roleName: 'Ventas regionales',
  departmentId: 'dept-1',
  departmentName: 'Comercial',
  active: true,
  emailVerified: false,
  createdAt: '2026-10-15T12:00:00Z',
  updatedAt: '2026-10-19T12:00:00Z',
};
describe('ConfigurationPageComponent', () => {
  const access = signal<CurrentAccess | null>(null);
  const getProfile = vi.fn();
  const ensureAccess = vi.fn();
  beforeEach(() => {
    access.set({
      roleId: 'role-1',
      roleName: 'Ventas regionales',
      departmentId: 'dept-1',
      systemAdministrator: false,
      permissions: { [BusinessModule.SALES_QUOTES]: ['READ', 'CREATE'] },
    });
    getProfile.mockReturnValue(of(profile));
    ensureAccess.mockReturnValue(of(access()));
    TestBed.configureTestingModule({
      imports: [ConfigurationPageComponent],
      providers: [
        provideRouter([]),
        { provide: SelfProfileService, useValue: { getProfile } },
        { provide: AuthService, useValue: { currentAccess: access, ensureAccess } },
      ],
    });
  });
  function render() {
    const fixture = TestBed.createComponent(ConfigurationPageComponent);
    fixture.detectChanges();
    return {
      fixture,
      component: fixture.componentInstance,
      text: () => (fixture.nativeElement as HTMLElement).textContent ?? '',
    };
  }
  it('displays complete profile and real custom role', () => {
    const { text } = render();
    for (const value of [
      'Ana García',
      'ana@example.com',
      '600123456',
      'Calle 1',
      'Madrid',
      '28001',
      'España',
      'Ventas regionales',
      'Comercial',

      'Pendiente de verificar',
    ])
      expect(text()).toContain(value);
    expect(text()).not.toContain('USER');
    expect(text()).not.toContain('private-account-id');
    expect(text()).not.toContain('Identificador de cuenta');
  });
  it('shows translated effective permissions and self actions without users access', () => {
    const { text } = render();
    for (const value of [
      'Presupuestos',
      'Ver presupuestos',
      'Crear presupuesto',
      'Editar perfil',
      'Cambiar contraseña',
    ])
      expect(text()).toContain(value);
    expect(text()).not.toContain('Administrador del sistema');
  });
  it('uses the authoritative administrator flag', () => {
    const { fixture, text } = render();
    access.update((value) => (value ? { ...value, systemAdministrator: true } : null));
    fixture.detectChanges();
    expect(text()).toContain('Tu cuenta es administradora del sistema');
  });
  it('handles absent optional data and falls back to username', () => {
    getProfile.mockReturnValue(
      of({
        ...profile,
        firstName: '',
        lastName: '',
        phone: null,
        address: null,
        roleName: null,
        departmentName: null,
      }),
    );
    const { component, text } = render();
    expect(component.fullName()).toBe('ana');
    expect(text()).toContain('No indicado');
    expect(text()).toContain('Sin asignar');
    expect(text()).not.toContain('undefined');
  });
  it('shows loading and a retryable profile error', () => {
    const pending = new Subject<UserDetails>();
    getProfile.mockReturnValue(pending);
    const { fixture, component, text } = render();
    expect(text()).toContain('Cargando tu perfil');
    pending.error(new Error());
    fixture.detectChanges();
    expect(text()).toContain('No pudimos cargar tu perfil');
    getProfile.mockReturnValue(of(profile));
    component.loadProfile();
    fixture.detectChanges();
    expect(text()).toContain('Ana García');
  });
  it('keeps profile visible during access failure and supports retry', () => {
    ensureAccess.mockReturnValue(throwError(() => new Error()));
    const { fixture, component, text } = render();
    expect(text()).toContain('Ana García');
    expect(text()).toContain('No pudimos consultar tus permisos');
    ensureAccess.mockReturnValue(of(access()));
    component.loadAccess();
    fixture.detectChanges();
    expect(text()).toContain('Presupuestos');
  });
  it('explains empty permissions', () => {
    access.update((value) => (value ? { ...value, permissions: {} } : null));
    expect(render().text()).toContain('No tienes módulos con acceso asignado');
  });
  it('preserves own-account action routes', () => {
    const { component } = render();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate');
    component.onEditName();
    expect(navigate).toHaveBeenCalledWith(['/platform/auth/change-username']);
    component.onChangePassword();
    expect(navigate).toHaveBeenCalledWith(['/platform/auth/change-password']);
  });
});
