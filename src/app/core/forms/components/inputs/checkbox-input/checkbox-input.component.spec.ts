import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CheckboxInputComponent } from './checkbox-input.component';

describe('CheckboxInputComponent', () => {
  let component: CheckboxInputComponent;
  let fixture: ComponentFixture<CheckboxInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckboxInputComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(CheckboxInputComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have label as required input', () => {
    fixture.componentRef.setInput('label', 'Test Label');
    fixture.detectChanges();

    expect(component.label()).toBe('Test Label');
  });

  it('should render label', () => {
    fixture.componentRef.setInput('label', 'Cliente Activo');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Cliente Activo');
  });

  it('should render icon when provided', () => {
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('icon', 'pi-check-circle');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const icon = compiled.querySelector('i');
    expect(icon?.className).toContain('pi-check-circle');
  });

  it('should not render icon when not provided', () => {
    fixture.componentRef.setInput('label', 'Test');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const icon = compiled.querySelector('i');
    expect(icon).toBeNull();
  });

  it('should create internal FormControl when control input is not provided', () => {
    fixture.componentRef.setInput('label', 'Test');
    fixture.detectChanges();

    expect(component.internalControl()).toBeInstanceOf(FormControl);
  });

  it('should use provided FormControl when control input is provided', () => {
    const externalControl = new FormControl(true);
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('control', externalControl);
    fixture.detectChanges();

    expect(component.internalControl()).toBe(externalControl);
  });

  it('should bind checkbox to internal control', () => {
    const externalControl = new FormControl(false);
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('control', externalControl);
    fixture.detectChanges();

    const checkbox = fixture.nativeElement.querySelector('p-checkbox');
    expect(checkbox).toBeTruthy();
  });

  it('should apply custom colSpan when provided', () => {
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('colSpan', 3);
    fixture.detectChanges();

    expect(component.colSpan()).toBe(3);
  });

  it('should default colSpan to 1', () => {
    fixture.componentRef.setInput('label', 'Test');
    fixture.detectChanges();

    expect(component.colSpan()).toBe(1);
  });

  it('should render checkbox component', () => {
    fixture.componentRef.setInput('label', 'Test');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const checkbox = compiled.querySelector('p-checkbox');
    expect(checkbox).toBeTruthy();
  });
});
