import { UserPreferencesService } from '@core/preferences/user-preferences.service';
import { KeyboardShortcutService } from '@core/shortcuts/keyboard-shortcut.service';
import { UserPhotoService } from '@features/platform/auth/services/api/user-photo.service';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ChangeUsernamePageComponent } from '@features/platform/auth/pages/change-username/change-username-page.component';
import { AuthService } from '@features/platform/auth/services/application/auth-application.service';
import { SelfProfileService } from '@features/platform/auth/services/api/self-profile.service';
import { UserDetails } from '@features/platform/auth/user/models/interfaces/user-details.interface';

const profile: UserDetails = {
  id: 'own-id',
  firstName: 'Ana',
  lastName: 'García',
  userName: 'ana',
  email: 'ana@example.com',
  phone: null,
  address: null,
  roleId: 'role',
  roleName: 'Ventas',
  departmentId: 'department',
  departmentName: 'Comercial',
  active: true,
  emailVerified: true,
  createdAt: '',
  updatedAt: '',
};
describe('Own profile editing', () => {
  const getProfile = vi.fn();
  const updateProfile = vi.fn();
  const syncProfileDisplay = vi.fn();
  beforeEach(() => {
    vi.clearAllMocks();
    getProfile.mockReturnValue(of(profile));
    updateProfile.mockReturnValue(of({ ...profile, userName: 'ana nueva' }));
    TestBed.configureTestingModule({
      imports: [ChangeUsernamePageComponent],
      providers: [
        provideRouter([]),
        { provide: UserPreferencesService, useValue: { syncLanguage: vi.fn() } },
        MessageService,
        { provide: KeyboardShortcutService, useValue: { register: () => () => undefined } },
        { provide: UserPhotoService, useValue: { get: vi.fn(), upload: vi.fn(), remove: vi.fn() } },
        { provide: SelfProfileService, useValue: { getProfile, updateProfile } },
        { provide: AuthService, useValue: { syncProfileDisplay, syncProfilePhoto: vi.fn() } },
      ],
    });
  });
  function render() {
    const fixture = TestBed.createComponent(ChangeUsernamePageComponent);
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance };
  }
  it('loads personal fields and renders shared tabs without administrative controls', () => {
    const { component, fixture } = render();
    expect(component.form.getRawValue()).toMatchObject({
      firstName: 'Ana',
      lastName: 'García',
      userName: 'ana',
    });
    expect(component.form.get('email')).toBeNull();
    for (const field of [
      'roleId',
      'departmentId',
      'permissions',
      'active',
      'emailVerified',
      'password',
    ])
      expect(component.form.get(field)).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Editar mi perfil');
    expect(fixture.nativeElement.textContent).toContain('Contacto y dirección');
  });
  it('loads and saves the profile language, updating active preferences', () => {
    getProfile.mockReturnValue(of({ ...profile, language: 'en' }));
    const { component } = render();
    expect(component.control('language').value).toBe('en');
    component.control('language').setValue('es');
    component.onSubmit();
    expect(updateProfile).toHaveBeenCalledWith(expect.objectContaining({ language: 'es' }));
    expect(TestBed.inject(UserPreferencesService).syncLanguage).toHaveBeenCalledWith('es');
  });
  it('submits normalized personal data and updates display only', () => {
    const { component } = render();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate');
    component.form.patchValue({
      userName: ' ana nueva ',
      phone: '+34 612 345 678',
      city: ' Madrid ',
    });
    component.onSubmit();
    expect(updateProfile).toHaveBeenCalledWith({
      language: 'es',
      userName: 'ana nueva',
      firstName: 'Ana',
      lastName: 'García',
      phone: '+34612345678',
      address: { street: null, city: 'Madrid', region: null, country: null, postalCode: null },
    });
    expect(syncProfileDisplay).toHaveBeenCalledWith('ana nueva');
    expect(navigate).toHaveBeenCalledWith(['/platform/auth/configuration']);
  });
  it('submits empty optional data as null', () => {
    const { component } = render();
    component.onSubmit();
    expect(updateProfile).toHaveBeenCalledWith(
      expect.objectContaining({ phone: null, address: null }),
    );
  });
  it('selects the invalid tab and rejects multiple phone numbers', () => {
    const { component } = render();
    component.control('phone').setValue('612345678,699123456');
    component.onSubmit();
    expect(component.activeTab()).toBe('contact');
    expect(updateProfile).not.toHaveBeenCalled();
    component.control('firstName').setValue('   ');
    component.onSubmit();
    expect(component.activeTab()).toBe('general');
    expect(component.control('firstName').touched).toBe(true);
  });
  it('preserves entered data after saving fails', () => {
    updateProfile.mockReturnValue(throwError(() => new Error('Unavailable')));
    const { component } = render();
    component.control('userName').setValue('draft name');
    component.onSubmit();
    expect(component.saving()).toBe(false);
    expect(component.control('userName').value).toBe('draft name');
    expect(syncProfileDisplay).not.toHaveBeenCalled();
  });
  it('blocks duplicate submissions and cancel during saving', () => {
    updateProfile.mockReturnValue(new Subject<UserDetails>());
    const { component } = render();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate');
    component.onSubmit();
    component.onSubmit();
    component.onCancel();
    expect(updateProfile).toHaveBeenCalledTimes(1);
    expect(navigate).not.toHaveBeenCalled();
  });
  it('blocks saving during loading and allows retry after load failure', () => {
    const pending = new Subject<UserDetails>();
    getProfile.mockReturnValue(pending);
    const { component } = render();
    component.onSubmit();
    pending.error(new Error());
    expect(component.error()).toBe(true);
    component.onSubmit();
    expect(updateProfile).not.toHaveBeenCalled();
    getProfile.mockReturnValue(of(profile));
    component.loadProfile();
    expect(component.error()).toBe(false);
    expect(component.control('firstName').value).toBe('Ana');
  });
  it('cancels without saving', () => {
    const { component } = render();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate');
    component.onCancel();
    expect(navigate).toHaveBeenCalledWith(['/platform/auth/configuration']);
    expect(updateProfile).not.toHaveBeenCalled();
  });
  it('exposes the own account so email and password can be changed from the profile', () => {
    const { component } = render();
    expect(component.account()).toEqual({ id: 'own-id', email: 'ana@example.com' });
    component.showEmailDialog.set(true);
    component.showPasswordDialog.set(true);
    expect(component.showEmailDialog()).toBe(true);
    expect(component.showPasswordDialog()).toBe(true);
  });
  it('renders the credential actions inside the form actions next to cancel', () => {
    const { fixture } = render();
    const host = fixture.nativeElement as HTMLElement;
    const actions = host.querySelector('app-form-actions');
    expect(actions?.textContent).toContain('Cambiar Correo');
    expect(actions?.textContent).toContain('Cambiar contraseña');
    expect(host.textContent).not.toContain('los gestiona tu administrador');
  });
  it('refreshes the profile after the email changes', () => {
    const { component } = render();
    getProfile.mockClear();
    getProfile.mockReturnValue(
      of({ ...profile, email: 'nueva@example.com', emailVerified: false }),
    );
    component.onEmailChanged('nueva@example.com');
    expect(component.account()?.email).toBe('nueva@example.com');
    expect(getProfile).toHaveBeenCalledTimes(1);
  });
});
