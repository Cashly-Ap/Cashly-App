import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { FieldGroupComponent } from './field-group.component';

describe('FieldGroupComponent', () => {
  let component: FieldGroupComponent;
  let fixture: ComponentFixture<FieldGroupComponent>;
  let compiled: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FieldGroupComponent],
    });

    fixture = TestBed.createComponent(FieldGroupComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render label when provided', () => {
    fixture.componentRef.setInput('label', 'Test Label');
    fixture.detectChanges();

    const label = compiled.querySelector('label');
    expect(label).toBeTruthy();
    expect(label?.textContent).toContain('Test Label');
  });

  it('should not render label when not provided', () => {
    fixture.componentRef.setInput('label', '');
    fixture.detectChanges();

    const label = compiled.querySelector('label');
    expect(label).toBeFalsy();
  });

  it('should render icon when provided', () => {
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('icon', 'pi-calendar');
    fixture.detectChanges();

    const icon = compiled.querySelector('i');
    expect(icon).toBeTruthy();
    expect(icon?.className).toContain('pi-calendar');
  });

  it('should not render icon when not provided', () => {
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('icon', '');
    fixture.detectChanges();

    const icon = compiled.querySelector('i');
    expect(icon).toBeFalsy();
  });

  it('should render help text when provided', () => {
    fixture.componentRef.setInput('helpText', 'This is help text');
    fixture.detectChanges();

    const helpText = compiled.querySelector('p');
    expect(helpText).toBeTruthy();
    expect(helpText?.textContent).toBe('This is help text');
  });

  it('should not render help text when not provided', () => {
    fixture.componentRef.setInput('helpText', '');
    fixture.detectChanges();

    const helpText = compiled.querySelector('p');
    expect(helpText).toBeFalsy();
  });

  it('should apply custom wrapper class', () => {
    fixture.componentRef.setInput('wrapperClass', 'custom-wrapper-class');
    fixture.detectChanges();

    const wrapper = compiled.querySelector('div');
    expect(wrapper?.className).toBe('custom-wrapper-class');
  });

  it('should apply default wrapper class', () => {
    fixture.detectChanges();

    const wrapper = compiled.querySelector('div');
    expect(wrapper?.className).toContain('rounded-lg');
    expect(wrapper?.className).toContain('p-3');
  });

  it('should project content via ng-content', () => {
    const testContent = '<input type="text" data-testid="projected-input" />';
    fixture = TestBed.createComponent(FieldGroupComponent);

    const nativeElement = fixture.nativeElement as HTMLElement;
    const div = nativeElement.querySelector('div');
    if (div) {
      div.innerHTML = testContent;
    }

    fixture.detectChanges();

    const projectedInput = nativeElement.querySelector('[data-testid="projected-input"]');
    expect(projectedInput).toBeTruthy();
  });

  it('should render icon with correct classes', () => {
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('icon', 'pi-dollar');
    fixture.componentRef.setInput('iconClass', 'text-red-500');
    fixture.detectChanges();

    const icon = compiled.querySelector('i');
    expect(icon?.className).toContain('pi-dollar');
    expect(icon?.className).toContain('text-red-500');
  });

  it('should apply custom label class', () => {
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('labelClass', 'custom-label-class');
    fixture.detectChanges();

    const label = compiled.querySelector('label');
    expect(label?.className).toBe('custom-label-class');
  });

  it('should apply custom help class', () => {
    fixture.componentRef.setInput('helpText', 'Help');
    fixture.componentRef.setInput('helpClass', 'custom-help-class');
    fixture.detectChanges();

    const help = compiled.querySelector('p');
    expect(help?.className).toBe('custom-help-class');
  });
});
