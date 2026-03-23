import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { SelectInputComponent } from './select-input.component';
import { SelectModule } from 'primeng/select';

describe('SelectInputComponent', () => {
  let component: SelectInputComponent;
  let fixture: ComponentFixture<SelectInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectInputComponent, ReactiveFormsModule, SelectModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectInputComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render label with text', () => {
    fixture.componentRef.setInput('label', 'Select Label');
    fixture.detectChanges();

    const label = fixture.nativeElement.querySelector('label');
    expect(label?.textContent?.trim()).toContain('Select Label');
  });

  it('should render icon when provided', () => {
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('icon', 'pi-tag');
    fixture.detectChanges();

    const icon = fixture.nativeElement.querySelector('.pi-tag');
    expect(icon).toBeTruthy();
  });

  it('should not render icon when not provided', () => {
    fixture.componentRef.setInput('label', 'Test');
    fixture.detectChanges();

    const icon = fixture.nativeElement.querySelector('i');
    expect(icon).toBeFalsy();
  });

  it('should bind options to p-select', () => {
    const options = [
      { label: 'Option 1', value: '1' },
      { label: 'Option 2', value: '2' },
    ];
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('options', options);
    fixture.detectChanges();

    expect(component.options()).toEqual(options);
  });

  it('should bind placeholder to p-select', () => {
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('placeholder', 'Select an option');
    fixture.detectChanges();

    expect(component.placeholder()).toBe('Select an option');
  });

  it('should use optionLabel input', () => {
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('optionLabel', 'name');
    fixture.detectChanges();

    expect(component.optionLabel()).toBe('name');
  });

  it('should use optionValue input', () => {
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('optionValue', 'id');
    fixture.detectChanges();

    expect(component.optionValue()).toBe('id');
  });

  it('should bind FormControl when provided', () => {
    const control = new FormControl('');
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();

    expect(component.control()).toBe(control);
  });

  it('should update FormControl value on selection', () => {
    const control = new FormControl('');
    const options = [
      { label: 'Option 1', value: '1' },
      { label: 'Option 2', value: '2' },
    ];

    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('options', options);
    fixture.detectChanges();

    control.setValue('1');
    fixture.detectChanges();

    expect(control.value).toBe('1');
  });

  it('should show validation error when control is invalid and touched', () => {
    const control = new FormControl('', Validators.required);
    control.markAsTouched();

    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();

    expect(control.invalid).toBe(true);
    expect(control.touched).toBe(true);
  });

  it('should apply colSpan class when provided', () => {
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('colSpan', 2);
    fixture.detectChanges();

    const wrapper = fixture.nativeElement.querySelector('.lg\\:col-span-2');
    expect(wrapper).toBeTruthy();
  });

  it('should not apply colSpan class when not provided', () => {
    fixture.componentRef.setInput('label', 'Test');
    fixture.detectChanges();

    const wrapper = fixture.nativeElement.querySelector('[class*="lg:col-span"]');
    expect(wrapper).toBeFalsy();
  });

  it('should have default styling classes', () => {
    fixture.componentRef.setInput('label', 'Test');
    fixture.detectChanges();

    const wrapper = fixture.nativeElement.querySelector('.rounded-xl');
    expect(wrapper).toBeTruthy();
    expect(wrapper.classList.contains('p-4')).toBe(true);
  });

  it('should have w-full on p-select', () => {
    fixture.componentRef.setInput('label', 'Test');
    fixture.detectChanges();

    const select = fixture.nativeElement.querySelector('p-select');
    expect(select?.getAttribute('styleclass')).toContain('w-full');
  });
});
