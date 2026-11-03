import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { SubmitButtonComponent } from './submit-button.component';

describe('SubmitButtonComponent', () => {
  let component: SubmitButtonComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [SubmitButtonComponent] });
    const fixture = TestBed.createComponent(SubmitButtonComponent);
    fixture.componentRef.setInput('labelKey', 'shared.save');
    component = fixture.componentInstance;
  });

  it('uses the create defaults for the new shortcut', () => {
    expect(component.shortcut()).toBe('submit');
    expect(component.resolvedPermission()).toBeNull();
    expect(component.resolvedIcon()).toBe('pi pi-check');
    expect(component.resolvedStyleClass()).toBe('');
  });

  it('uses the create defaults when the shortcut is new', () => {
    const fixture = TestBed.createComponent(SubmitButtonComponent);
    fixture.componentRef.setInput('labelKey', 'sales.quotes.newQuote');
    fixture.componentRef.setInput('shortcut', 'new');
    fixture.detectChanges();

    expect(fixture.componentInstance.resolvedPermission()).toBe('CREATE');
    expect(fixture.componentInstance.resolvedIcon()).toBe('pi pi-plus');
    expect(fixture.componentInstance.resolvedStyleClass()).toBe('font-medium w-full sm:w-auto');
  });

  it('emits the action', () => {
    let emitted = 0;
    component.action.subscribe(() => (emitted += 1));

    component.action.emit();

    expect(emitted).toBe(1);
  });

  it('keeps explicit overrides', () => {
    const fixture = TestBed.createComponent(SubmitButtonComponent);
    fixture.componentRef.setInput('labelKey', 'shared.add');
    fixture.componentRef.setInput('icon', 'pi pi-plus');
    fixture.componentRef.setInput('permission', 'EXECUTE');
    fixture.componentRef.setInput('severity', 'primary');
    fixture.detectChanges();

    expect(fixture.componentInstance.resolvedIcon()).toBe('pi pi-plus');
    expect(fixture.componentInstance.resolvedPermission()).toBe('EXECUTE');
    expect(fixture.componentInstance.severity()).toBe('primary');
  });
});
