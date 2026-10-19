import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ChangeUsernamePageComponent } from './change-username-page.component';
import { AuthService } from '../../services/application/auth-application.service';
import { SelfProfileService } from '../../services/api/self-profile.service';
import { UserDetails } from '../../user/models/interfaces/user-details.interface';

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
        MessageService,
        { provide: SelfProfileService, useValue: { getProfile, updateProfile } },
        { provide: AuthService, useValue: { syncProfileDisplay } },
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
      email: profile.email,
    });
    expect(component.control('email').disabled).toBe(true);
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
});
