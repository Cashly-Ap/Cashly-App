import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { of } from 'rxjs';
import { ConfigurationPageComponent } from './configuration-page.component';
import { AuthService } from '@features/auth/services';
import { UserResponse } from '@features/auth/models';

describe('ConfigurationPageComponent', () => {
  let component: ConfigurationPageComponent;
  let fixture: ComponentFixture<ConfigurationPageComponent>;
  let mockRouter: {
    navigate: ReturnType<typeof vi.fn>;
    events: ReturnType<typeof of>;
    url: string;
    createUrlTree: ReturnType<typeof vi.fn>;
    serializeUrl: ReturnType<typeof vi.fn>;
  };
  let mockAuthService: {
    currentUser: ReturnType<typeof signal<UserResponse | null>>;
    clearAuthState: ReturnType<typeof vi.fn>;
    getUserType: ReturnType<typeof vi.fn>;
    isMerchant: ReturnType<typeof vi.fn>;
  };
  let mockActivatedRoute: { snapshot: { paramMap: { get: ReturnType<typeof vi.fn> } } };

  const mockUser: UserResponse = {
    id: '123',
    email: 'test@example.com',
    displayName: 'testuser',
    type: 'USER',
    active: true,
    createdAt: '2025-01-01T00:00:00Z',
  };

  beforeEach(async () => {
    mockRouter = {
      navigate: vi.fn(),
      events: of(),
      url: '/',
      createUrlTree: vi.fn(),
      serializeUrl: vi.fn(),
    };

    mockAuthService = {
      currentUser: signal(mockUser),
      clearAuthState: vi.fn(),
      getUserType: vi.fn().mockReturnValue('USER'),
      isMerchant: vi.fn().mockReturnValue(false),
    };

    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: vi.fn().mockReturnValue(null),
        },
      },
    };

    await TestBed.configureTestingModule({
      imports: [ConfigurationPageComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: AuthService, useValue: mockAuthService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfigurationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('currentUser', () => {
    it('should expose currentUser signal from auth service', () => {
      expect(component.currentUser()).toEqual(mockUser);
    });
  });

  describe('getInitials', () => {
    it('should return first letter of email uppercased', () => {
      expect(component.getInitials()).toBe('T');
    });
  });

  describe('onEditName', () => {
    it('should navigate to change username page', () => {
      component.onEditName();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/change-username']);
    });
  });

  describe('onChangePassword', () => {
    it('should navigate to change password page', () => {
      component.onChangePassword();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/change-password']);
    });
  });

  describe('user information display', () => {
    it('should have access to user email', () => {
      expect(component.currentUser()?.email).toBe('test@example.com');
    });

    it('should have access to user displayName', () => {
      expect(component.currentUser()?.displayName).toBe('testuser');
    });

    it('should have access to user active status', () => {
      expect(component.currentUser()?.active).toBe(true);
    });

    it('should have access to user type', () => {
      expect(component.currentUser()?.type).toBe('USER');
    });

    it('should have access to user createdAt date', () => {
      expect(component.currentUser()?.createdAt).toBe('2025-01-01T00:00:00Z');
    });
  });
});
