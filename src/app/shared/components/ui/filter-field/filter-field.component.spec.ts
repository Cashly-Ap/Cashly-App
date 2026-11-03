import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { FilterFieldComponent } from './filter-field.component';

@Component({
  standalone: true,
  imports: [FilterFieldComponent],
  template: `<app-filter-field labelKey="finance.billing.invoices.status">
    <span class="control">control</span>
  </app-filter-field>`,
})
class FilterFieldHostComponent {}

describe('FilterFieldComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [FilterFieldComponent, FilterFieldHostComponent] });
  });

  it('renders the translated label and projects the control', () => {
    const fixture = TestBed.createComponent(FilterFieldHostComponent);
    fixture.detectChanges();

    const field = fixture.nativeElement.querySelector('app-filter-field') as HTMLElement;
    expect(field.querySelector('label')?.textContent?.trim().length).toBeGreaterThan(0);
    expect(field.querySelector('.control')?.textContent).toBe('control');
  });
});
