import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { MetricCardComponent } from '@shared/components/ui/metric-card/metric-card.component';

@Component({
  standalone: true,
  imports: [MetricCardComponent],
  template: `<app-metric-card
    labelKey="analytics.dashboard.lowStock"
    icon="pi pi-box"
    module="inventory"
  >
    <span class="metric-value">12</span>
  </app-metric-card>`,
})
class MetricCardHostComponent {}

describe('MetricCardComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [MetricCardComponent, MetricCardHostComponent] });
  });

  it('renders the label, icon and projected value', () => {
    const fixture = TestBed.createComponent(MetricCardHostComponent);
    fixture.detectChanges();

    const host = fixture.nativeElement.querySelector('app-metric-card') as HTMLElement;
    expect(host.querySelector('.dashboard-metric-value .metric-value')?.textContent).toBe('12');
    expect(host.querySelector('i')?.className).toContain('pi-box');
    expect(host.querySelector('span')?.textContent?.trim().length).toBeGreaterThan(0);
  });

  it('marks primary metrics', () => {
    const fixture = TestBed.createComponent(MetricCardComponent);
    fixture.componentRef.setInput('labelKey', 'analytics.dashboard.monthlySales');
    fixture.componentRef.setInput('primary', true);
    fixture.componentRef.setInput('module', 'sales');
    fixture.detectChanges();

    const card = fixture.nativeElement.querySelector('.dashboard-metric') as HTMLElement;
    expect(card.classList.contains('dashboard-metric-primary')).toBe(true);
    expect(card.getAttribute('data-module')).toBe('sales');
  });
});
