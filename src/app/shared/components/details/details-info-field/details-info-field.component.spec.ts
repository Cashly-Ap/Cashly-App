import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { DetailsInfoFieldComponent } from '@shared/components/details/details-info-field/details-info-field.component';
import { ComponentRef } from '@angular/core';

describe('DetailsInfoFieldComponent', () => {
  let component: DetailsInfoFieldComponent;
  let fixture: ComponentFixture<DetailsInfoFieldComponent>;
  let componentRef: ComponentRef<DetailsInfoFieldComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DetailsInfoFieldComponent],
    });

    fixture = TestBed.createComponent(DetailsInfoFieldComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display label and value for text type', () => {
    componentRef.setInput('label', 'Test Label');
    componentRef.setInput('value', 'Test Value');
    componentRef.setInput('type', 'text');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const label = compiled.querySelector('.uppercase');
    expect(label?.textContent?.trim()).toBe('Test Label');

    const value = compiled.querySelector('span:not(.uppercase)');
    expect(value?.textContent?.trim()).toBe('Test Value');
  });

  it('should use monospace font for code type', () => {
    componentRef.setInput('label', 'Code');
    componentRef.setInput('value', '#12345');
    componentRef.setInput('type', 'code');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const value = compiled.querySelector('.font-mono');
    expect(value).toBeTruthy();
    expect(value?.textContent?.trim()).toBe('#12345');
  });

  it('should use bold font for currency type', () => {
    componentRef.setInput('label', 'Price');
    componentRef.setInput('value', '$100.00');
    componentRef.setInput('type', 'currency');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const values = compiled.querySelectorAll('.font-semibold');
    const currencyValue = Array.from(values).find((el) => el.textContent?.trim() === '$100.00');
    expect(currencyValue).toBeTruthy();
    expect(currencyValue?.textContent?.trim()).toBe('$100.00');
  });

  it('should project content for badge type', () => {
    componentRef.setInput('label', 'Status');
    componentRef.setInput('value', '');
    componentRef.setInput('type', 'badge');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const container = compiled.querySelector('div');
    expect(container).toBeTruthy();
  });
});
