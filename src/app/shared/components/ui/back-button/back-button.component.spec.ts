import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { BackButtonComponent } from './back-button.component';

describe('BackButtonComponent', () => {
  let component: BackButtonComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [BackButtonComponent] });
    component = TestBed.createComponent(BackButtonComponent).componentInstance;
  });

  it('uses the shared back defaults', () => {
    expect(component.labelKey()).toBe('finance.billing.creditnotes.back');
    expect(component.severity()).toBe('secondary');
    expect(component.outlined()).toBe(true);
    expect(component.styleClass()).toBe('w-full sm:w-auto');
  });

  it('emits back when clicked', () => {
    let emitted = 0;
    component.back.subscribe(() => (emitted += 1));

    component.back.emit();

    expect(emitted).toBe(1);
  });

  it('allows a custom label and style', () => {
    const fixture = TestBed.createComponent(BackButtonComponent);
    fixture.componentRef.setInput('labelKey', 'users.profile.back');
    fixture.componentRef.setInput('styleClass', 'custom-class');
    fixture.detectChanges();

    expect(fixture.componentInstance.labelKey()).toBe('users.profile.back');
    expect(fixture.componentInstance.styleClass()).toBe('custom-class');
  });
});
