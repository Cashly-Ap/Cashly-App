import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ListItemComponent } from '@core/forms/components/dynamic-lists/list-item/list-item.component';
import { FormControl } from '@angular/forms';

describe('ListItemComponent', () => {
  let component: ListItemComponent;
  let fixture: ComponentFixture<ListItemComponent>;
  let compiled: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ListItemComponent],
    });

    fixture = TestBed.createComponent(ListItemComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement;

    fixture.componentRef.setInput('control', new FormControl(''));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render input with placeholder', () => {
    fixture.componentRef.setInput('placeholder', 'Test placeholder');
    fixture.detectChanges();

    const input = compiled.querySelector('input');
    expect(input).toBeTruthy();
    expect(input?.placeholder).toBe('Test placeholder');
  });

  it('should render delete button', () => {
    fixture.detectChanges();

    const button = compiled.querySelector('p-button');
    expect(button).toBeTruthy();
  });

  it('should emit remove event when delete button clicked', () => {
    const removeSpy = vi.fn();
    component.remove.subscribe(removeSpy);

    fixture.detectChanges();

    const button = compiled.querySelector('button');
    button?.click();

    expect(removeSpy).toHaveBeenCalled();
  });

  it('should render icon when provided', () => {
    fixture.componentRef.setInput('icon', 'pi-phone');
    fixture.detectChanges();

    const icon = compiled.querySelector('i');
    expect(icon).toBeTruthy();
    expect(icon?.className).toContain('pi-phone');
  });

  it('should not render icon when not provided', () => {
    fixture.componentRef.setInput('icon', '');
    fixture.detectChanges();

    const icon = compiled.querySelector('i');
    expect(icon).toBeFalsy();
  });

  it('should set input type', () => {
    fixture.componentRef.setInput('inputType', 'email');
    fixture.detectChanges();

    const input = compiled.querySelector('input');
    expect(input?.type).toBe('email');
  });

  it('should bind form control', () => {
    const control = new FormControl('test value');
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();

    const input = compiled.querySelector('input');
    expect(input?.value).toBe('test value');
  });
});
