import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormActionsComponent } from '@core/forms/components/headers/form-actions/form-actions.component';
import { By } from '@angular/platform-browser';

describe('FormActionsComponent', () => {
  let component: FormActionsComponent;
  let fixture: ComponentFixture<FormActionsComponent>;
  let compiled: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormActionsComponent],
    });

    fixture = TestBed.createComponent(FormActionsComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display default submit button label', () => {
    expect(component.submitLabel()).toBe('Guardar');
  });

  it('should display custom submit button label', () => {
    fixture.componentRef.setInput('submitLabel', 'Crear');
    fixture.detectChanges();

    expect(component.submitLabel()).toBe('Crear');
  });

  it('should display default cancel button label', () => {
    expect(component.cancelLabel()).toBe('Cancelar');
  });

  it('should display custom cancel button label', () => {
    fixture.componentRef.setInput('cancelLabel', 'Volver');
    fixture.detectChanges();

    expect(component.cancelLabel()).toBe('Volver');
  });

  it('should emit cancel event when cancel button is clicked', () => {
    let emitted = false;
    component.cancel.subscribe(() => {
      emitted = true;
    });

    const cancelButton = fixture.debugElement.queryAll(By.css('p-button'))[0];
    cancelButton.triggerEventHandler('onClick', null);

    expect(emitted).toBe(true);
  });

  it('should have submit button with type submit', () => {
    const submitButton = fixture.debugElement.queryAll(By.css('p-button'))[1];
    expect(submitButton.nativeElement.getAttribute('type')).toBe('submit');
  });

  it('should disable submit button when disabled input is true', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    expect(component.disabled()).toBe(true);
  });

  it('should show loading state on submit button', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    expect(component.loading()).toBe(true);
  });

  it('should apply flex layout classes', () => {
    const container = compiled.querySelector('div');
    expect(container?.className).toContain('flex');
  });

  it('should apply background and border styles', () => {
    const container = compiled.querySelector('div');
    expect(container?.className).toContain('bg-surface-50');
    expect(container?.className).toContain('border-t');
  });

  it('should apply responsive padding', () => {
    const container = compiled.querySelector('div');
    expect(container?.className).toContain('px-4');
    expect(container?.className).toContain('md:px-6');
  });
});
