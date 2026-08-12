import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { NumberInputComponent } from '@core/forms/components/inputs/number-input/number-input.component';
import { InputNumberModule } from 'primeng/inputnumber';

describe('NumberInputComponent', () => {
  let component: NumberInputComponent;
  let fixture: ComponentFixture<NumberInputComponent>;
  let control: FormControl;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NumberInputComponent, ReactiveFormsModule, InputNumberModule],
    }).compileComponents();

    fixture = TestBed.createComponent(NumberInputComponent);
    component = fixture.componentInstance;
    control = new FormControl(0);

    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render label with text', () => {
    fixture.componentRef.setInput('label', 'Amount');
    fixture.detectChanges();

    const label = fixture.nativeElement.querySelector('label');
    expect(label?.textContent?.trim()).toContain('Amount');
  });

  it('should render icon when provided', () => {
    fixture.componentRef.setInput('icon', 'pi-dollar');
    fixture.detectChanges();

    const icon = fixture.nativeElement.querySelector('.pi-dollar');
    expect(icon).toBeTruthy();
  });

  it('should not render icon when not provided', () => {
    fixture.detectChanges();

    const icon = fixture.nativeElement.querySelector('i');
    expect(icon).toBeFalsy();
  });

  it('should render help text when provided', () => {
    fixture.componentRef.setInput('helpText', 'Enter a number');
    fixture.detectChanges();

    const help = fixture.nativeElement.querySelector('p');
    expect(help?.textContent).toContain('Enter a number');
  });

  it('should not render help text when not provided', () => {
    fixture.detectChanges();

    const help = fixture.nativeElement.querySelector('p');
    expect(help).toBeFalsy();
  });

  it('should update FormControl value', () => {
    control.setValue(100);
    fixture.detectChanges();

    expect(control.value).toBe(100);
  });

  it('should apply min value', () => {
    fixture.componentRef.setInput('min', 0);
    fixture.detectChanges();

    expect(component.min()).toBe(0);
  });

  it('should apply max value', () => {
    fixture.componentRef.setInput('max', 100);
    fixture.detectChanges();

    expect(component.max()).toBe(100);
  });

  it('should apply mode decimal', () => {
    fixture.componentRef.setInput('mode', 'decimal');
    fixture.detectChanges();

    expect(component.mode()).toBe('decimal');
  });

  it('should apply prefix', () => {
    fixture.componentRef.setInput('prefix', '$ ');
    fixture.detectChanges();

    expect(component.prefix()).toBe('$ ');
  });

  it('should apply suffix', () => {
    fixture.componentRef.setInput('suffix', ' USD');
    fixture.detectChanges();

    expect(component.suffix()).toBe(' USD');
  });

  it('should show buttons when showButtons is true', () => {
    fixture.componentRef.setInput('showButtons', true);
    fixture.detectChanges();

    expect(component.showButtons()).toBe(true);
  });

  it('should apply colSpan class when provided', () => {
    fixture.componentRef.setInput('colSpan', 2);
    fixture.detectChanges();

    const wrapper = fixture.nativeElement.querySelector('.lg\\:col-span-2');
    expect(wrapper).toBeTruthy();
  });

  it('should have default styling classes', () => {
    fixture.detectChanges();

    const wrapper = fixture.nativeElement.querySelector('.rounded-xl');
    expect(wrapper).toBeTruthy();
  });

  it('should render icon when provided', () => {
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('icon', 'pi-dollar');
    fixture.detectChanges();

    const icon = fixture.nativeElement.querySelector('.pi-dollar');
    expect(icon).toBeTruthy();
  });

  it('should not render icon when not provided', () => {
    fixture.componentRef.setInput('label', 'Test');
    fixture.detectChanges();

    const icon = fixture.nativeElement.querySelector('i');
    expect(icon).toBeFalsy();
  });

  it('should render help text when provided', () => {
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('helpText', 'Enter a number');
    fixture.detectChanges();

    const help = fixture.nativeElement.querySelector('p');
    expect(help?.textContent).toContain('Enter a number');
  });

  it('should not render help text when not provided', () => {
    fixture.componentRef.setInput('label', 'Test');
    fixture.detectChanges();

    const help = fixture.nativeElement.querySelector('p');
    expect(help).toBeFalsy();
  });

  it('should bind FormControl when provided', () => {
    const control = new FormControl(0);
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();

    expect(component.control()).toBe(control);
  });

  it('should update FormControl value', () => {
    const control = new FormControl(0);
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();

    control.setValue(100);
    fixture.detectChanges();

    expect(control.value).toBe(100);
  });

  it('should apply min value', () => {
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('min', 0);
    fixture.detectChanges();

    expect(component.min()).toBe(0);
  });

  it('should apply max value', () => {
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('max', 100);
    fixture.detectChanges();

    expect(component.max()).toBe(100);
  });

  it('should apply mode decimal', () => {
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('mode', 'decimal');
    fixture.detectChanges();

    expect(component.mode()).toBe('decimal');
  });

  it('should apply prefix', () => {
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('prefix', '$ ');
    fixture.detectChanges();

    expect(component.prefix()).toBe('$ ');
  });

  it('should apply suffix', () => {
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('suffix', ' USD');
    fixture.detectChanges();

    expect(component.suffix()).toBe(' USD');
  });

  it('should show buttons when showButtons is true', () => {
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('showButtons', true);
    fixture.detectChanges();

    expect(component.showButtons()).toBe(true);
  });

  it('should apply colSpan class when provided', () => {
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('colSpan', 2);
    fixture.detectChanges();

    const wrapper = fixture.nativeElement.querySelector('.lg\\:col-span-2');
    expect(wrapper).toBeTruthy();
  });

  it('should have default styling classes', () => {
    fixture.componentRef.setInput('label', 'Test');
    fixture.detectChanges();

    const wrapper = fixture.nativeElement.querySelector('.rounded-xl');
    expect(wrapper).toBeTruthy();
    expect(wrapper.classList.contains('p-4')).toBe(true);
  });
});
