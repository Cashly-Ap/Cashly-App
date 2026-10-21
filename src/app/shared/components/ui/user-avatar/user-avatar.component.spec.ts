import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { UserAvatarComponent } from './user-avatar.component';
import { UserPhotoService } from '@features/platform/auth/services/api/user-photo.service';

describe('UserAvatarComponent', () => {
  it('uses the own-profile endpoint for the navbar and revokes its blob on destruction', () => {
    const get = vi.fn().mockReturnValue(of(new Blob(['image'])));
    const revoke = vi.spyOn(URL, 'revokeObjectURL');
    TestBed.configureTestingModule({
      providers: [{ provide: UserPhotoService, useValue: { get } }],
    });
    const fixture = TestBed.createComponent(UserAvatarComponent);
    fixture.componentRef.setInput('photoPath', 'users/photo.png');
    fixture.detectChanges();
    expect(get).toHaveBeenCalledWith(undefined);
    const url = fixture.componentInstance.url();
    expect(url).toMatch(/^blob:/);
    fixture.destroy();
    expect(revoke).toHaveBeenCalledWith(url);
    revoke.mockRestore();
  });

  it('does not request an absent photo and keeps the initials fallback', () => {
    const get = vi.fn();
    TestBed.configureTestingModule({
      providers: [{ provide: UserPhotoService, useValue: { get } }],
    });
    const fixture = TestBed.createComponent(UserAvatarComponent);
    fixture.componentRef.setInput('name', 'Gabriel');
    fixture.detectChanges();
    expect(get).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('G');
    fixture.destroy();
  });
});
