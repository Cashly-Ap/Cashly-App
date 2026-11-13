import { LanguageService } from '@core/i18n/language.service';
import { TranslationService } from '@core/i18n/translation.service';
import { LocalizedNumberPipe } from '@core/i18n/localized-format.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { TranslateOptionsPipe } from '@core/i18n/translate-options.pipe';
import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserPreferencesService } from '@core/preferences/user-preferences.service';
import { chartPalette, moduleColor } from '@core/preferences/module-appearance';
import { ThemeService } from '@core/theme/components/theme-toggle/theme.service';
import {
  DashboardApiService,
  DashboardSummary,
  MonthlySales,
  TopItem,
  InvoiceDue,
} from '@features/analytics/dashboard/services/api/dashboard-api.service';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { SelectModule } from 'primeng/select';

const DASHBOARD_CHART_COLORS = {
  neutral: '#777777',
  lightSeries: '#171717',
  darkSeries: '#f5f5f5',
  lightFill: 'rgba(23, 23, 23, 0.12)',
  darkFill: 'rgba(245, 245, 245, 0.12)',
  lightTicks: '#525252',
  lightGrid: '#e5e5e5',
  darkTicks: '#d4d4d4',
  darkGrid: '#404040',
} as const;

import { ModuleIconComponent } from '@shared/components/ui/module-icon/module-icon.component';
import { MetricCardComponent } from '@shared/components/ui/metric-card/metric-card.component';
import { TextBadgeComponent } from '@shared/components/ui/text-badge/text-badge.component';
import { DataTableComponent } from '@shared/components/ui/data-table/data-table.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DataTableComponent,
    MetricCardComponent,
    TextBadgeComponent,
    TranslatePipe,
    LocalizedNumberPipe,
    CommonModule,
    BaseChartDirective,
    ModuleIconComponent,
    FormsModule,
    SelectModule,
    TranslateOptionsPipe,
  ],
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: './dashboard-page.component.html',
})
export class DashboardPageComponent implements OnInit {
  private readonly language = inject(LanguageService);
  private readonly translations = inject(TranslationService);
  private readonly api = inject(DashboardApiService);
  private readonly themeService = inject(ThemeService);
  private readonly preferences = inject(UserPreferencesService);

  readonly summary = signal<DashboardSummary | null>(null);
  readonly monthlySales = signal<MonthlySales[]>([]);
  readonly topProducts = signal<TopItem[]>([]);
  readonly topCustomers = signal<TopItem[]>([]);
  readonly invoiceDueSchedule = signal<InvoiceDue[]>([]);
  readonly pendingInvoiceCount = computed(() => this.invoiceDueSchedule().length);
  readonly overdueInvoiceCount = computed(
    () => this.invoiceDueSchedule().filter((invoice) => this.isOverdue(invoice.dueDate)).length,
  );
  readonly loading = signal(true);
  readonly salesPeriod = signal<'WEEK' | 'MONTH' | 'YEAR'>('MONTH');
  readonly salesPeriodOptions = [
    { label: 'analytics.dashboard.periodWeek', value: 'WEEK' },
    { label: 'analytics.dashboard.periodMonth', value: 'MONTH' },
    { label: 'analytics.dashboard.periodYear', value: 'YEAR' },
  ];

  readonly barChartType = 'bar' as const;
  readonly horizontalBarChartType = 'bar' as const;
  readonly lineChartType = 'line' as const;

  private readonly salesChartSource = signal<ChartData<'bar'>>({ labels: [], datasets: [] });
  private readonly salesChartBaseOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { callback: (v) => (v as number).toLocaleString(this.language.locale()) + '$' },
      },
    },
  };

  private readonly productsChartSource = signal<ChartData<'bar'>>({ labels: [], datasets: [] });
  private readonly productsChartBaseOptions: ChartConfiguration<'bar'>['options'] = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { callback: (v) => (v as number).toLocaleString(this.language.locale()) + '$' },
      },
      y: { ticks: { font: { size: 11 } } },
    },
  };

  private readonly customersChartSource = signal<ChartData<'bar'>>({ labels: [], datasets: [] });
  private readonly customersChartBaseOptions: ChartConfiguration<'bar'>['options'] = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { callback: (v) => (v as number).toLocaleString(this.language.locale()) + '$' },
      },
      y: { ticks: { font: { size: 11 } } },
    },
  };

  private readonly invoiceCustomerChartBaseOptions: ChartConfiguration<'bar'>['options'] = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { callback: (v) => Number(v).toLocaleString(this.language.locale()) + '$' },
      },
      y: { ticks: { font: { size: 11 } } },
    },
  };

  readonly salesChartData = computed(() => {
    const isDark = this.themeService.isDarkMode();
    const color =
      this.preferences.colorMode() === 'informative'
        ? moduleColor('sales', isDark)
        : isDark
          ? DASHBOARD_CHART_COLORS.darkSeries
          : DASHBOARD_CHART_COLORS.lightSeries;
    const source = this.salesChartSource();
    return {
      ...source,
      labels: this.monthlySales().map((item) => this.formatSalesBucket(item.month)),
      datasets: source.datasets.map((dataset) => ({
        ...dataset,
        label: this.translations.t(dataset.label),
        backgroundColor: color,
        borderColor: color,
        pointBackgroundColor: color,
      })),
    };
  });

  readonly salesChartOptions = computed<ChartConfiguration<'bar'>['options']>(() => ({
    ...this.salesChartBaseOptions,
    animation: false,
    scales: this.themedScales(this.salesChartBaseOptions?.scales, this.themeService.isDarkMode()),
  }));

  readonly productsChartData = computed(() => {
    const isDark = this.themeService.isDarkMode();
    const color =
      this.preferences.colorMode() === 'informative'
        ? chartPalette(this.productsChartSource().labels?.length ?? 0, isDark)
        : isDark
          ? DASHBOARD_CHART_COLORS.darkSeries
          : DASHBOARD_CHART_COLORS.lightSeries;
    const source = this.productsChartSource();
    return {
      ...source,
      datasets: source.datasets.map((dataset) => ({
        ...dataset,
        label: this.translations.t(dataset.label),
        backgroundColor: color,
        borderColor: color,
        pointBackgroundColor: color,
      })),
    };
  });

  readonly productsChartOptions = computed<ChartConfiguration<'bar'>['options']>(() => ({
    ...this.productsChartBaseOptions,
    animation: false,
    scales: this.themedScales(
      this.productsChartBaseOptions?.scales,
      this.themeService.isDarkMode(),
    ),
  }));

  readonly customersChartData = computed(() => {
    const isDark = this.themeService.isDarkMode();
    const color =
      this.preferences.colorMode() === 'informative'
        ? chartPalette(this.customersChartSource().labels?.length ?? 0, isDark).reverse()
        : isDark
          ? DASHBOARD_CHART_COLORS.darkSeries
          : DASHBOARD_CHART_COLORS.lightSeries;
    const source = this.customersChartSource();
    return {
      ...source,
      datasets: source.datasets.map((dataset) => ({
        ...dataset,
        label: this.translations.t(dataset.label),
        backgroundColor: color,
        borderColor: color,
        pointBackgroundColor: color,
      })),
    };
  });

  readonly customersChartOptions = computed<ChartConfiguration<'bar'>['options']>(() => ({
    ...this.customersChartBaseOptions,
    animation: false,
    scales: this.themedScales(
      this.customersChartBaseOptions?.scales,
      this.themeService.isDarkMode(),
    ),
  }));

  private readonly dueColor = computed(() => {
    const isDark = this.themeService.isDarkMode();
    return this.preferences.colorMode() === 'informative'
      ? moduleColor('finance', isDark)
      : isDark
        ? DASHBOARD_CHART_COLORS.darkSeries
        : DASHBOARD_CHART_COLORS.lightSeries;
  });

  readonly pendingInvoicesChartData = computed<ChartData<'bar'>>(() =>
    this.invoicesByCustomer(this.invoiceDueSchedule()),
  );

  readonly overdueInvoicesChartData = computed<ChartData<'bar'>>(() =>
    this.invoicesByCustomer(
      this.invoiceDueSchedule().filter((invoice) => this.isOverdue(invoice.dueDate)),
    ),
  );

  readonly invoiceCustomerChartOptions = computed<ChartConfiguration<'bar'>['options']>(() => ({
    ...this.invoiceCustomerChartBaseOptions,
    animation: false,
    scales: this.themedScales(
      this.invoiceCustomerChartBaseOptions?.scales,
      this.themeService.isDarkMode(),
    ),
  }));

  private invoicesByCustomer(invoices: InvoiceDue[]): ChartData<'bar'> {
    const totals = new Map<string, number>();
    for (const invoice of invoices) {
      totals.set(invoice.customerName, (totals.get(invoice.customerName) ?? 0) + invoice.amount);
    }
    const entries = [...totals.entries()].sort((a, b) => b[1] - a[1]);
    return {
      labels: entries.map(([customer]) => customer),
      datasets: [
        {
          data: entries.map(([, total]) => total),
          backgroundColor: this.dueColor(),
          borderRadius: 6,
        },
      ],
    };
  }

  private themedScales(
    scales: NonNullable<ChartConfiguration<'bar'>['options']>['scales'],
    isDark: boolean,
  ): NonNullable<ChartConfiguration<'bar'>['options']>['scales'] {
    const tickColor = isDark ? DASHBOARD_CHART_COLORS.darkTicks : DASHBOARD_CHART_COLORS.lightTicks;
    const gridColor = isDark ? DASHBOARD_CHART_COLORS.darkGrid : DASHBOARD_CHART_COLORS.lightGrid;
    return {
      ...scales,
      x: {
        ...scales?.['x'],
        ticks: { ...scales?.['x']?.ticks, color: tickColor },
        grid: { ...scales?.['x']?.grid, color: gridColor },
        border: { ...scales?.['x']?.border, color: gridColor },
      },
      y: {
        ...scales?.['y'],
        ticks: { ...scales?.['y']?.ticks, color: tickColor },
        grid: { ...scales?.['y']?.grid, color: gridColor },
        border: { ...scales?.['y']?.border, color: gridColor },
      },
    };
  }
  ngOnInit(): void {
    this.api.getSummary().subscribe((s) => this.summary.set(s));

    this.loadSales(this.salesPeriod());

    this.api.getTopProducts(5).subscribe((data) => {
      this.topProducts.set(data);
      this.productsChartSource.set({
        labels: data.map((d) => d.name),
        datasets: [
          {
            data: data.map((d) => d.total),
            backgroundColor: DASHBOARD_CHART_COLORS.neutral,
            borderRadius: 6,
          },
        ],
      });
    });

    this.api.getTopCustomers(5).subscribe((data) => {
      this.topCustomers.set(data);
      this.customersChartSource.set({
        labels: data.map((d) => d.name),
        datasets: [
          {
            data: data.map((d) => d.total),
            backgroundColor: DASHBOARD_CHART_COLORS.neutral,
            borderRadius: 6,
          },
        ],
      });
    });

    this.loading.set(false);

    this.api.getInvoiceDueSchedule().subscribe((data) => {
      const limitedSchedule = data.slice(0, 10);
      this.invoiceDueSchedule.set(limitedSchedule);
    });
  }

  onSalesPeriodChange(period: 'WEEK' | 'MONTH' | 'YEAR' | null): void {
    if (!period) return;
    this.salesPeriod.set(period);
    this.loadSales(period);
  }

  private loadSales(period: 'WEEK' | 'MONTH' | 'YEAR'): void {
    this.api.getMonthlySales(period).subscribe((data) => {
      this.monthlySales.set(data);
      this.salesChartSource.set({
        labels: data.map((item) => this.formatSalesBucket(item.month)),
        datasets: [
          {
            data: data.map((item) => item.total),
            backgroundColor: DASHBOARD_CHART_COLORS.neutral,
            borderRadius: 6,
          },
        ],
      });
    });
  }

  private formatSalesBucket(bucket: string): string {
    const period = this.salesPeriod();
    if (period === 'YEAR') return bucket;
    if (period === 'WEEK') {
      const [, week] = bucket.split('-W');
      return `${this.translations.t('analytics.dashboard.weekShort')} ${week}`;
    }
    return this.formatMonth(bucket);
  }

  private formatMonth(month: string): string {
    const [year, index] = month.split('-').map(Number);
    return new Intl.DateTimeFormat(this.language.locale(), {
      month: 'short',
      year: 'numeric',
    }).format(new Date(year, index - 1, 1));
  }

  formatDueDate(date: string): string {
    return new Intl.DateTimeFormat(this.language.locale(), {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(`${date}T00:00:00`));
  }

  isOverdue(date: string): boolean {
    return date < new Date().toISOString().slice(0, 10);
  }

  private formatDate(date: string): string {
    return new Intl.DateTimeFormat(this.language.locale(), {
      day: '2-digit',
      month: 'short',
    }).format(new Date(`${date}T00:00:00`));
  }
}
