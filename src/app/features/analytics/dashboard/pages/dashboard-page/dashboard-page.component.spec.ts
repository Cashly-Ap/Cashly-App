import { UserPreferencesService, ColorMode } from '@core/preferences/user-preferences.service';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ThemeService } from '@core/theme/components/theme-toggle/theme.service';
import { DashboardApiService } from '@features/analytics/dashboard/services/api/dashboard-api.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { of } from 'rxjs';
import { DashboardPageComponent } from '@features/analytics/dashboard/pages/dashboard-page/dashboard-page.component';

describe('Dashboard chart theme', () => {
  const isDarkMode = signal(false);
  const colorMode = signal<ColorMode>('minimal');

  beforeEach(() => {
    isDarkMode.set(false);
    colorMode.set('minimal');
    TestBed.configureTestingModule({
      providers: [
        { provide: ThemeService, useValue: { isDarkMode } },
        { provide: UserPreferencesService, useValue: { colorMode } },
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
    const options = [component.salesChartOptions(), component.profitChartOptions()];
    for (const chartOptions of options) {
      for (const axis of ['x', 'y']) {
        expect(chartOptions).toHaveProperty(`scales.${axis}.ticks.color`, tickColor);
        expect(chartOptions).toHaveProperty(`scales.${axis}.grid.color`, gridColor);
      }
    }
    for (const chartOptions of [
      component.productsChartOptions(),
      component.customersChartOptions(),
      component.invoiceCustomerChartOptions(),
    ]) {
      expect(chartOptions).toHaveProperty('plugins.legend.labels.color', tickColor);
    }
  }

  it('uses readable labels and grids when opened in light mode', () => {
    expectChartPalette(createComponent(), '#525252', '#e5e5e5');
  });

  it('uses readable labels and grids when opened in dark mode', () => {
    isDarkMode.set(true);
    expectChartPalette(createComponent(), '#d4d4d4', '#404040');
  });

  it('recolors loaded datasets on repeated theme changes without losing values', () => {
    TestBed.overrideProvider(DashboardApiService, {
      useValue: {
        getSummary: () => of(null),
        getMonthlySales: () => of([{ month: '2026-10', total: 100 }]),
        getTopProducts: () => of([{ id: '1', name: 'Product', total: 100 }]),
        getTopCustomers: () => of([{ id: '1', name: 'Customer', total: 100 }]),
        getProfitSummary: () => of({ billing: 100, expenses: 40, net: 60 }),
        getRecentActivity: () => of([]),
        getInvoiceDueSchedule: () => of([{ dueDate: '2026-11-14', amount: 100 }]),
      },
    });
    const component = createComponent();
    component.ngOnInit();

    for (const dark of [false, true, false]) {
      isDarkMode.set(dark);
      const color = dark ? '#f5f5f5' : '#171717';
      for (const data of [component.salesChartData()]) {
        expect(data.datasets[0].backgroundColor).toBe(color);
        expect(data.datasets[0].data).toEqual([100]);
      }
      for (const data of [
        component.productsChartData(),
        component.customersChartData(),
        component.pendingInvoicesChartData(),
      ]) {
        expect(data.datasets[0].backgroundColor).toEqual([dark ? '#f5f5f5' : '#171717']);
        expect(data.datasets[0].data).toEqual([100]);
      }
      expectChartPalette(component, dark ? '#d4d4d4' : '#525252', dark ? '#404040' : '#e5e5e5');
    }
  });

  it('replaces every chart configuration after a theme toggle and preserves chart behavior', () => {
    const component = createComponent();
    const previousOptions = [
      component.salesChartOptions(),
      component.profitChartOptions(),
      component.customersChartOptions(),
      component.invoiceCustomerChartOptions(),
    ];
    const currencyFormatter = component.salesChartOptions()?.scales?.['y']?.ticks?.callback;

    isDarkMode.set(true);
    TestBed.tick();

    expectChartPalette(component, '#d4d4d4', '#404040');
    const updatedOptions = [
      component.salesChartOptions(),
      component.profitChartOptions(),
      component.customersChartOptions(),
      component.invoiceCustomerChartOptions(),
    ];
    updatedOptions.forEach((options, index) => expect(options).not.toBe(previousOptions[index]));
    expect(component.salesChartOptions()?.scales?.['y']?.ticks?.callback).toBe(currencyFormatter);
    expect(component.productsChartOptions()?.maintainAspectRatio).toBe(false);
    expect(component.productsChartOptions()?.plugins?.legend).toMatchObject({
      display: true,
      position: 'bottom',
    });

    isDarkMode.set(false);
    colorMode.set('minimal');
    TestBed.tick();

    expectChartPalette(component, '#525252', '#e5e5e5');
  });
  it('recolors informative charts with distinct category colors and restores minimal values', () => {
    const monthlySales = vi.fn(() => of([{ month: '2026-10', total: 100 }]));
    TestBed.overrideProvider(DashboardApiService, {
      useValue: {
        getSummary: () => of(null),
        getMonthlySales: monthlySales,
        getTopProducts: () =>
          of([
            { id: '1', name: 'A', total: 100 },
            { id: '2', name: 'B', total: 200 },
          ]),
        getTopCustomers: () =>
          of([
            { id: '1', name: 'A', total: 100 },
            { id: '2', name: 'B', total: 200 },
          ]),
        getProfitSummary: () => of({ billing: 300, expenses: 120, net: 180 }),
        getRecentActivity: () => of([]),
        getInvoiceDueSchedule: () => of([{ dueDate: '2026-11-14', amount: 100 }]),
      },
    });
    const component = createComponent();
    component.ngOnInit();
    colorMode.set('informative');
    expect(component.salesChartData().datasets[0].backgroundColor).toBe('#1d4ed8');
    const products = component.productsChartData().datasets[0];
    expect(new Set(products.backgroundColor as string[]).size).toBe(2);
    expect(products.data).toEqual([100, 200]);
    const pendingInvoices = component.pendingInvoicesChartData().datasets[0];
    expect(new Set(pendingInvoices.backgroundColor as string[]).size).toBe(1);
    isDarkMode.set(true);
    expect(component.salesChartData().datasets[0].backgroundColor).toBe('#93c5fd');
    colorMode.set('minimal');
    expect(component.productsChartData().datasets[0].backgroundColor).toEqual([
      '#f5f5f5',
      '#d4d4d4',
    ]);
    expect(component.productsChartData().datasets[0].data).toEqual([100, 200]);
    expect(monthlySales).toHaveBeenCalledTimes(1);
  });

  it('computes monthly profit as billing minus expenses and feeds the profit chart', () => {
    TestBed.overrideProvider(DashboardApiService, {
      useValue: {
        getSummary: () =>
          of({
            monthlySales: 500,
            monthlyExpenses: 200,
            monthlyProfit: 300,
            pendingOrders: 4,
            overdueReceivables: 0,
            lowStockProducts: 0,
          }),
        getMonthlySales: () => of([]),
        getTopProducts: () => of([]),
        getTopCustomers: () => of([]),
        getProfitSummary: () => of({ billing: 500, expenses: 200, net: 300 }),
        getInvoiceDueSchedule: () => of([]),
      },
    });
    const component = createComponent();
    component.ngOnInit();

    expect(component.monthlyProfit()).toBe(300);
    expect(component.profitChartData().datasets[0].data).toEqual([500, 200, 300]);
  });

  it('reloads the profit chart for the selected period', () => {
    const profitSummary = vi.fn(() => of({ billing: 900, expenses: 400, net: 500 }));
    TestBed.overrideProvider(DashboardApiService, {
      useValue: {
        getSummary: () => of(null),
        getMonthlySales: () => of([]),
        getTopProducts: () => of([]),
        getTopCustomers: () => of([]),
        getProfitSummary: profitSummary,
        getInvoiceDueSchedule: () => of([]),
      },
    });
    const component = createComponent();
    component.ngOnInit();

    component.onProfitPeriodChange('WEEK');

    expect(profitSummary).toHaveBeenLastCalledWith('WEEK');
    expect(component.profitPeriod()).toBe('WEEK');
    expect(component.profitChartData().datasets[0].data).toEqual([900, 400, 500]);
  });

  it('formats chart tooltips with the app currency format', () => {
    const component = createComponent();
    const barLabel = component.profitChartOptions()?.plugins?.tooltip?.callbacks?.label;
    const doughnutLabel = component.productsChartOptions()?.plugins?.tooltip?.callbacks?.label;
    const invoke = (callback: unknown, context: unknown): string =>
      (callback as (item: unknown) => string)(context);

    expect(invoke(barLabel, { label: 'Ganancia', parsed: { y: 34.3 } })).toBe('Ganancia: 34,30$');
    expect(invoke(doughnutLabel, { label: 'Ground coffee', parsed: 34.3 })).toBe(
      'Ground coffee: 34,30$',
    );
  });
});
