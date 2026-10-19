import { TestBed } from '@angular/core/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { provideRouter, ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { signal } from '@angular/core';
import { UsersFormPageComponent } from './users-form-page.component';
import { UserApplicationService } from '../../services/application/user-application.service';
import { AccessManagementService } from '../../../authorization/services/access-management.service';
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
});
