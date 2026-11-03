import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { StatCardComponent } from './stat-card.component';

@Component({
  standalone: true,
  imports: [StatCardComponent],
  template: `<app-stat-card labelKey="inventory.warehouses.products" tone="success">
    <span class="stat-value">12</span>
  </app-stat-card>`,
})
class StatCardHostComponent {}

describe('StatCardComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [StatCardComponent, StatCardHostComponent] });
  });

  it('renders the label and projected value', () => {
    const fixture = TestBed.createComponent(StatCardHostComponent);
    fixture.detectChanges();

    const card = fixture.nativeElement.querySelector('app-stat-card') as HTMLElement;
    expect(card.querySelector('.stat-value')?.textContent).toBe('12');
    expect(card.querySelector('.text-xs')?.textContent?.trim().length).toBeGreaterThan(0);
  });

  it('applies the tone color', () => {
    const fixture = TestBed.createComponent(StatCardHostComponent);
    fixture.detectChanges();

    const value = fixture.nativeElement.querySelector('.text-2xl') as HTMLElement;
    expect(value.className).toContain('text-green-600');
  });
});
