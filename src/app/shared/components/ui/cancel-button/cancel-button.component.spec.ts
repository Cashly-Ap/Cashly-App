import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CancelButtonComponent } from './cancel-button.component';

describe('CancelButtonComponent', () => {
  let component: CancelButtonComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CancelButtonComponent] });
    component = TestBed.createComponent(CancelButtonComponent).componentInstance;
  });

  it('uses the shared cancel defaults', () => {
    expect(component.labelKey()).toBe('shared.cancel');
    expect(component.label()).toBeUndefined();
    expect(component.icon()).toBe('pi pi-times');
    expect(component.outlined()).toBe(true);
    expect(component.severity()).toBe('secondary');
    expect(component.disabled()).toBe(false);
  });

  it('emits cancelled when clicked', () => {
    let emitted = 0;
    component.cancelled.subscribe(() => (emitted += 1));

    component.cancelled.emit();

    expect(emitted).toBe(1);
  });

  it('accepts a plain label override and disabled state', () => {
    const fixture = TestBed.createComponent(CancelButtonComponent);
    fixture.componentRef.setInput('label', 'Volver');
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    expect(fixture.componentInstance.label()).toBe('Volver');
    expect(fixture.componentInstance.disabled()).toBe(true);
  });
});
