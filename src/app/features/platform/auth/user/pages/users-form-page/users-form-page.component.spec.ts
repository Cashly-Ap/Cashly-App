import { UserPreferencesService } from '@core/preferences/user-preferences.service';
import { FormMode } from '@core/forms/enums/form-mode.enum';
import { TestBed } from '@angular/core/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { provideRouter, ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { UserPhotoService } from '@features/platform/auth/services/api/user-photo.service';
import { UserDetails } from '@features/platform/auth/user/models/interfaces/user-details.interface';
import { signal } from '@angular/core';
import { UsersFormPageComponent } from '@features/platform/auth/user/pages/users-form-page/users-form-page.component';
import { UserApplicationService } from '@features/platform/auth/user/services/application/user-application.service';
import { AccessManagementService } from '@features/platform/auth/authorization/services/access-management.service';
describe('User profile form', () => {
  const userService = {
    loading: signal(false),
    createUser: vi.fn(),
    updateUser: vi.fn(),
    loadUserById: vi.fn(),
  };
  let component: UsersFormPageComponent;
  beforeEach(async () => {
    userService.createUser.mockReset().mockReturnValue(of({ id: 'u' }));
    await TestBed.configureTestingModule({
      imports: [UsersFormPageComponent],
      providers: [
        provideRouter([]),
        {
          provide: UserPreferencesService,
          useValue: { syncLanguage: vi.fn(), ready: signal(true), shortcutsEnabled: signal(false) },
        },
        provideHttpClient(),
        MessageService,
        { provide: UserApplicationService, useValue: userService },
        {
          provide: AccessManagementService,
          useValue: {
            roleOptions: () => of([{ id: 'r', name: 'Custom' }]),
            departmentOptions: () => of([{ id: 'd', name: 'Support' }]),
          },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({})),
            snapshot: { paramMap: convertToParamMap({}), queryParamMap: convertToParamMap({}) },
          },
        },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(UsersFormPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  function valid() {
    component.form.patchValue({
      email: 'user@cashly.com',
      password: 'Password123',
      userName: 'testuser',
      firstName: ' Test ',
      lastName: ' User ',
      roleId: 'r',
      departmentId: 'd',
    });
  }
  it('defaults new users to Spanish and sends the selected language', () => {
    expect(component.control('language').value).toBe('es');
    valid();
    component.control('language').setValue('en');
    component.onSubmit();
    expect(userService.createUser).toHaveBeenCalledWith(
      expect.objectContaining({ language: 'en' }),
    );
  });
  it('rejects unsupported languages before saving', () => {
    valid();
    component.control('language').setValue('fr');
    expect(component.form.invalid).toBe(true);
  });
  it('requires profile references and removes editable enum/direct grants', () => {
    expect(component.form.get('role')).toBeNull();
    expect(component.form.get('modulePermissions')).toBeNull();
    expect(component.form.invalid).toBe(true);
    valid();
    expect(component.form.valid).toBe(true);
    expect(component.roles()[0].label).toBe('Custom');
  });
  it('saves profile and references in one create request with a normalized phone', () => {
    valid();
    component.form.patchValue({ phone: '+34 612 345 678' });
    component.onSubmit();
    expect(userService.createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: 'Test',
        lastName: 'User',
        roleId: 'r',
        departmentId: 'd',
        phone: '+34612345678',
      }),
    );
    expect(userService.createUser.mock.calls[0][0]).not.toHaveProperty('modulePermissions');
  });
  it('has one phone control and rejects multiple numbers', () => {
    valid();
    expect(component.form.get('phones')).toBeNull();
    component.form.patchValue({ phone: '612345678,612345679' });
    component.onSubmit();
    expect(userService.createUser).not.toHaveBeenCalled();
    expect(component.activeTab()).toBe('contact');
  });
  it('uploads the selected photo against the newly created user', () => {
    valid();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const file = new File(['photo'], 'user.png', { type: 'image/png' });
    component.photo.setValue(file);
    const upload = vi
      .spyOn(TestBed.inject(UserPhotoService), 'upload')
      .mockReturnValue(of({ id: 'u', photoPath: 'users/photo.png' } as UserDetails));
    component.onSubmit();
    expect(upload).toHaveBeenCalledWith(file, 'u');
    expect(navigate).toHaveBeenCalledWith(['/platform/users', 'u']);
    expect(userService.createUser).toHaveBeenCalledTimes(1);
  });
  it('leaves a saved user available for photo retry when only the upload fails', () => {
    valid();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const notify = vi.spyOn(TestBed.inject(MessageService), 'add');
    component.photo.setValue(new File(['photo'], 'user.png'));
    vi.spyOn(TestBed.inject(UserPhotoService), 'upload').mockReturnValue(
      throwError(() => new Error('upload failed')),
    );
    component.onSubmit();
    expect(userService.createUser).toHaveBeenCalledTimes(1);
    expect(notify).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'warn', summary: 'Usuario guardado sin foto' }),
    );
    expect(navigate).toHaveBeenCalledWith(['/platform/users', 'u']);
  });
  it('allows an absent phone', () => {
    valid();
    component.onSubmit();
    expect(userService.createUser).toHaveBeenCalledWith(expect.objectContaining({ phone: null }));
  });
  it('rejects blank names and preserves password strength checks', () => {
    valid();
    component.form.patchValue({ firstName: '   ', password: 'password' });
    expect(component.form.invalid).toBe(true);
  });
  it('round-trips nullable optional address fields and phone without throwing', () => {
    valid();
    component.form.patchValue({
      street: 'Main Street',
      city: null,
      region: null,
      country: null,
      postalCode: null,
    });
    component.form.patchValue({ phone: '+34 (612).345-678' });
    component.onSubmit();
    expect(userService.createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        address: {
          street: 'Main Street',
          city: null,
          region: null,
          country: null,
          postalCode: null,
        },
        phone: '+34612345678',
      }),
    );
  });
  it('opens the saved user detail after updating', () => {
    valid();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    userService.updateUser.mockReturnValue(of({ id: 'edited-user' }));
    component.mode.set(FormMode.EDIT);
    component.entityId.set('edited-user');
    component.onSubmit();
    expect(navigate).toHaveBeenCalledWith(['/platform/users', 'edited-user']);
  });
});
