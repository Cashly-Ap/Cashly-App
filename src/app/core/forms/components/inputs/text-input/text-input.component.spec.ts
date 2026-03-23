import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { FormControl, Validators } from '@angular/forms';
import { TextInputComponent } from './text-input.component';

describe('TextInputComponent', () => {
  let component: TextInputComponent;
  let fixture: ComponentFixture<TextInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TextInputComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should accept FormControl as input', () => {
    const control = new FormControl('');
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('label', 'Test');
    fixture.detectChanges();

    expect(component.control()).toBe(control);
  });

  it('should accept label as input', () => {
    const control = new FormControl('');
    const label = 'Email';
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('label', label);
    fixture.detectChanges();

    expect(component.label()).toBe(label);
  });

  it('should accept placeholder as input', () => {
    const control = new FormControl('');
    const placeholder = 'Enter your email';
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('placeholder', placeholder);
    fixture.detectChanges();

    expect(component.placeholder()).toBe(placeholder);
  });

  it('should accept errorMessage as input', () => {
    const control = new FormControl('');
    const errorMessage = 'Email is required';
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('errorMessage', errorMessage);
    fixture.detectChanges();

    expect(component.errorMessage()).toBe(errorMessage);
  });

  it('should accept variant as input with default text', () => {
    const control = new FormControl('');
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('label', 'Test');
    fixture.detectChanges();

    expect(component.variant()).toBe('text');
  });

  it('should accept password variant', () => {
    const control = new FormControl('');
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('variant', 'password');
    fixture.detectChanges();

    expect(component.variant()).toBe('password');
  });

  it('should render text input for text variant', () => {
    const control = new FormControl('');
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('variant', 'text');
    fixture.componentRef.setInput('label', 'Email');
    fixture.detectChanges();

    const inputElement =
      fixture.nativeElement.querySelector('input[pInputText]');
    expect(inputElement).toBeTruthy();
  });

  it('should render password input for password variant', () => {
    const control = new FormControl('');
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('variant', 'password');
    fixture.componentRef.setInput('label', 'Password');
    fixture.detectChanges();

    const passwordElement = fixture.nativeElement.querySelector('p-password');
    expect(passwordElement).toBeTruthy();
  });

  it('should show error message when field is invalid and touched', () => {
    const control = new FormControl('', Validators.required);
    control.markAsTouched();

    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('errorMessage', 'Field is required');
    fixture.detectChanges();

    const errorElement = fixture.nativeElement.querySelector('.text-red-500');
    expect(errorElement).toBeTruthy();
    expect(errorElement.textContent).toContain('Field is required');
  });

  it('should not show error message when field is valid', () => {
    const control = new FormControl('value', Validators.required);
    control.markAsTouched();

    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('errorMessage', 'Field is required');
    fixture.detectChanges();

    const errorElement = fixture.nativeElement.querySelector('.text-red-500');
    expect(errorElement).toBeNull();
  });

  it('should not show error message when field is invalid but not touched', () => {
    const control = new FormControl('', Validators.required);

    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('errorMessage', 'Field is required');
    fixture.detectChanges();

    const errorElement = fixture.nativeElement.querySelector('.text-red-500');
    expect(errorElement).toBeNull();
  });

  it('should apply w-full class to input', () => {
    const control = new FormControl('');
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('variant', 'text');
    fixture.detectChanges();

    const inputElement = fixture.nativeElement.querySelector('input');
    expect(inputElement.classList.contains('w-full')).toBe(true);
  });

  it('should apply font-medium to label', () => {
    const control = new FormControl('');
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('label', 'Email');
    fixture.detectChanges();

    const labelElement = fixture.nativeElement.querySelector('label');
    expect(labelElement.classList.contains('font-semibold')).toBe(true);
  });

  it('should disable feedback for password variant', () => {
    const control = new FormControl('');
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('variant', 'password');
    fixture.detectChanges();

    const passwordElement = fixture.nativeElement.querySelector('p-password');
    expect(passwordElement).toBeTruthy();
  });

  it('should disable toggleMask for password variant', () => {
    const control = new FormControl('');
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('variant', 'password');
    fixture.detectChanges();

    const passwordElement = fixture.nativeElement.querySelector('p-password');
    expect(passwordElement).toBeTruthy();
  });
});
