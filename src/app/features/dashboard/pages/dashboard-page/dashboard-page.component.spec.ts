import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ThemeService } from '@core/theme/components/theme-toggle/theme.service';
import { DashboardApiService } from '@features/dashboard/services/api/dashboard-api.service';
import { beforeEach, describe, expect, it } from 'vitest';
import { DashboardPageComponent } from './dashboard-page.component';

describe('Dashboard chart theme', () => {
  const isDarkMode = signal(false);

  beforeEach(() => {
    isDarkMode.set(false);
    TestBed.configureTestingModule({
      providers: [
        { provide: ThemeService, useValue: { isDarkMode } },
        { provide: DashboardApiService, useValue: {} },
      ],
    });
  });

  function createComponent(): DashboardPageComponent {
    const component = TestBed.runInInjectionContext(() => new DashboardPageComponent());
    TestBed.tick();
    return component;
  }

  function expectChartPalette(
    component: DashboardPageComponent,
    tickColor: string,
    gridColor: string,
  ): void {
    const options = [
      component.salesChartOptions,
      component.productsChartOptions,
      component.customersChartOptions,
      component.dueChartOptions,
    ];
    for (const chartOptions of options) {
      for (const axis of ['x', 'y']) {
        expect(chartOptions).toHaveProperty(`scales.${axis}.ticks.color`, tickColor);
        expect(chartOptions).toHaveProperty(`scales.${axis}.grid.color`, gridColor);
      }
    }
  }

  it('uses readable labels and grids when opened in light mode', () => {
    expectChartPalette(createComponent(), '#525252', '#e5e5e5');
  });

  it('uses readable labels and grids when opened in dark mode', () => {
    isDarkMode.set(true);
    expectChartPalette(createComponent(), '#d4d4d4', '#404040');
  });

  it('replaces every chart configuration after a theme toggle and preserves chart behavior', () => {
    const component = createComponent();
    const previousOptions = [
      component.salesChartOptions,
      component.productsChartOptions,
      component.customersChartOptions,
      component.dueChartOptions,
    ];
    const currencyFormatter = component.salesChartOptions?.scales?.['y']?.ticks?.callback;

    isDarkMode.set(true);
    TestBed.tick();

    expectChartPalette(component, '#d4d4d4', '#404040');
    const updatedOptions = [
      component.salesChartOptions,
      component.productsChartOptions,
      component.customersChartOptions,
      component.dueChartOptions,
    ];
    updatedOptions.forEach((options, index) => expect(options).not.toBe(previousOptions[index]));
    expect(component.salesChartOptions?.scales?.['y']?.ticks?.callback).toBe(currencyFormatter);
    expect(component.productsChartOptions?.indexAxis).toBe('y');
    expect(component.productsChartOptions?.maintainAspectRatio).toBe(false);
    expect(component.productsChartOptions?.scales?.['y']?.ticks?.font).toEqual({ size: 11 });
    expect(component.dueChartOptions?.interaction).toEqual({ intersect: false, mode: 'index' });

    isDarkMode.set(false);
    TestBed.tick();

    expectChartPalette(component, '#525252', '#e5e5e5');
  });
});
