import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormActionsComponent } from '@core/forms/components/headers/form-actions/form-actions.component';
import { By } from '@angular/platform-browser';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EMPTY } from 'rxjs';

@Component({
  selector: 'app-form-actions-host',
  standalone: true,
  imports: [ReactiveFormsModule, FormActionsComponent],
  template: `
    <form [formGroup]="form">
      <app-form-actions [disabled]="false" />
    </form>
  `,
})
class FormActionsHostComponent {
  readonly form = new FormGroup({ name: new FormControl('') });
}

const routerMock = { url: '/test', events: EMPTY };

describe('FormActionsComponent', () => {
  let component: FormActionsComponent;
  let fixture: ComponentFixture<FormActionsComponent>;
  let compiled: HTMLElement;

  beforeEach(() => {
    routerMock.url = '/test';
    TestBed.configureTestingModule({
      imports: [FormActionsComponent, FormActionsHostComponent],
      providers: [{ provide: Router, useValue: routerMock }],
    });

    fixture = TestBed.createComponent(FormActionsComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement;
    fixture.detectChanges();
  });

  afterEach(() => {
    routerMock.url = '/test';
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
    const submitButton = compiled.querySelector('app-submit-button button[type="submit"]');
    expect(submitButton).not.toBeNull();
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

  it('should disable submit on edit routes while the form is pristine', () => {
    routerMock.url = '/test/edit';
    const hostFixture = TestBed.createComponent(FormActionsHostComponent);
    hostFixture.detectChanges();

    const actions = hostFixture.debugElement.query(By.directive(FormActionsComponent))
      .componentInstance as FormActionsComponent;

    expect(actions.submitDisabled()).toBe(true);

    hostFixture.componentInstance.form.markAsDirty();
    expect(actions.submitDisabled()).toBe(true);

    hostFixture.componentInstance.form.get('name')?.setValue('changed');
    expect(actions.submitDisabled()).toBe(false);

    hostFixture.componentInstance.form.get('name')?.setValue('');
    expect(actions.submitDisabled()).toBe(true);
  });

  it('uses the loaded values as the baseline when the form is patched while pristine', () => {
    routerMock.url = '/test/edit';
    const hostFixture = TestBed.createComponent(FormActionsHostComponent);
    hostFixture.detectChanges();

    const actions = hostFixture.debugElement.query(By.directive(FormActionsComponent))
      .componentInstance as FormActionsComponent;

    hostFixture.componentInstance.form.get('name')?.setValue('loaded');
    expect(actions.submitDisabled()).toBe(true);

    hostFixture.componentInstance.form.markAsDirty();
    hostFixture.componentInstance.form.get('name')?.setValue('edited');
    expect(actions.submitDisabled()).toBe(false);
  });

  it('should keep submit enabled on create routes while the form is pristine', () => {
    routerMock.url = '/test/new';
    const hostFixture = TestBed.createComponent(FormActionsHostComponent);
    hostFixture.detectChanges();

    const actions = hostFixture.debugElement.query(By.directive(FormActionsComponent))
      .componentInstance as FormActionsComponent;

    expect(actions.submitDisabled()).toBe(false);
  });
});
