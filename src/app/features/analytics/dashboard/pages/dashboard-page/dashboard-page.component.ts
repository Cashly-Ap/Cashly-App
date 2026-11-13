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
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserPreferencesService } from '@core/preferences/user-preferences.service';
import { chartPalette, moduleColor } from '@core/preferences/module-appearance';
import { ThemeService } from '@core/theme/components/theme-toggle/theme.service';
import {
  DashboardApiService,
  DashboardPeriod,
  DashboardSummary,
  MonthlySales,
  ProfitSummary,
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

const MONO_PALETTE = {
  light: ['#171717', '#404040', '#737373', '#a3a3a3', '#d4d4d4'],
  dark: ['#f5f5f5', '#d4d4d4', '#a3a3a3', '#737373', '#404040'],
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
  readonly upcomingInvoices = signal<InvoiceDue[]>([]);
  readonly overdueInvoices = signal<InvoiceDue[]>([]);
  readonly profitSummary = signal<ProfitSummary | null>(null);
  readonly pendingInvoiceCount = computed(
    () => this.summary()?.pendingInvoices ?? this.upcomingInvoices().length,
  );
  readonly overdueInvoiceCount = computed(
    () => this.summary()?.overdueInvoices ?? this.overdueInvoices().length,
  );
  readonly monthlyExpenses = computed(() => this.summary()?.monthlyExpenses ?? 0);
  readonly monthlyProfit = computed(() => {
    const summary = this.summary();
    if (!summary) return 0;
    return summary.monthlyProfit ?? summary.monthlySales - this.monthlyExpenses();
  });
  readonly loading = signal(true);
  readonly salesPeriod = signal<DashboardPeriod>('MONTH');
  readonly profitPeriod = signal<DashboardPeriod>('MONTH');
  readonly salesPeriodOptions = [
    { label: 'analytics.dashboard.periodDay', value: 'DAY' },
    { label: 'analytics.dashboard.periodWeek', value: 'WEEK' },
    { label: 'analytics.dashboard.periodMonth', value: 'MONTH' },
    { label: 'analytics.dashboard.periodYear', value: 'YEAR' },
  ];

  readonly barChartType = 'bar' as const;
  readonly doughnutChartType = 'doughnut' as const;
  readonly lineChartType = 'line' as const;

  private readonly salesChartSource = signal<ChartData<'bar'>>({ labels: [], datasets: [] });
  private readonly salesChartBaseOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) =>
            `${context.label ?? ''}: ${this.formatCurrency(Number(context.parsed.y))}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { callback: (v) => (v as number).toLocaleString(this.language.locale()) + '$' },
      },
    },
  };

  private readonly productsChartSource = signal<ChartData<'doughnut'>>({
    labels: [],
    datasets: [],
  });
  private readonly productsChartBaseOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '62%',
  };

  private readonly customersChartSource = signal<ChartData<'doughnut'>>({
    labels: [],
    datasets: [],
  });
  private readonly customersChartBaseOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '62%',
  };

  private readonly invoiceChartBaseOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '62%',
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

  private readonly profitChartBaseOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) =>
            `${context.label ?? ''}: ${this.formatCurrency(Number(context.parsed.y))}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { callback: (v) => (v as number).toLocaleString(this.language.locale()) + '$' },
      },
    },
  };

  readonly profitChartData = computed<ChartData<'bar'>>(() => {
    const isDark = this.themeService.isDarkMode();
    const colors =
      this.preferences.colorMode() === 'informative'
        ? chartPalette(3, isDark)
        : [...MONO_PALETTE[isDark ? 'dark' : 'light']].slice(0, 3);
    const billing = this.profitSummary()?.billing ?? this.summary()?.monthlySales ?? 0;
    const expenses = this.profitSummary()?.expenses ?? this.monthlyExpenses();
    const net = this.profitSummary()?.net ?? billing - expenses;
    return {
      labels: [
        this.translations.t('analytics.dashboard.profit'),
        this.translations.t('analytics.dashboard.totalExpenses'),
        this.translations.t('analytics.dashboard.net'),
      ],
      datasets: [
        {
          data: [billing, expenses, net],
          backgroundColor: colors,
          borderRadius: 6,
          maxBarThickness: 96,
        },
      ],
    };
  });

  readonly profitChartOptions = computed<ChartConfiguration<'bar'>['options']>(() => ({
    ...this.profitChartBaseOptions,
    animation: false,
    scales: this.themedScales(this.profitChartBaseOptions?.scales, this.themeService.isDarkMode()),
  }));

  readonly productsChartData = computed<ChartData<'doughnut'>>(() => {
    const isDark = this.themeService.isDarkMode();
    const source = this.productsChartSource();
    const count = source.labels?.length ?? 0;
    const colors = this.doughnutColors(count, isDark);
    return {
      ...source,
      datasets: source.datasets.map((dataset) => ({
        ...dataset,
        label: this.translations.t(dataset.label),
        backgroundColor: colors,
        borderColor: isDark ? '#171717' : '#ffffff',
        borderWidth: 2,
        hoverOffset: 6,
      })),
    };
  });

  readonly productsChartOptions = computed<ChartConfiguration<'doughnut'>['options']>(() =>
    this.doughnutOptions(this.productsChartBaseOptions, this.themeService.isDarkMode()),
  );

  readonly customersChartData = computed<ChartData<'doughnut'>>(() => {
    const isDark = this.themeService.isDarkMode();
    const source = this.customersChartSource();
    const count = source.labels?.length ?? 0;
    const colors = this.doughnutColors(count, isDark);
    return {
      ...source,
      datasets: source.datasets.map((dataset) => ({
        ...dataset,
        label: this.translations.t(dataset.label),
        backgroundColor: colors,
        borderColor: isDark ? '#171717' : '#ffffff',
        borderWidth: 2,
        hoverOffset: 6,
      })),
    };
  });

  readonly customersChartOptions = computed<ChartConfiguration<'doughnut'>['options']>(() =>
    this.doughnutOptions(this.customersChartBaseOptions, this.themeService.isDarkMode()),
  );

  readonly pendingInvoicesChartData = computed<ChartData<'doughnut'>>(() =>
    this.invoicesByCustomer(this.upcomingInvoices()),
  );

  readonly overdueInvoicesChartData = computed<ChartData<'doughnut'>>(() =>
    this.invoicesByCustomer(this.overdueInvoices()),
  );

  readonly invoiceCustomerChartOptions = computed<ChartConfiguration<'doughnut'>['options']>(() =>
    this.doughnutOptions(this.invoiceChartBaseOptions, this.themeService.isDarkMode()),
  );

  private invoicesByCustomer(invoices: InvoiceDue[]): ChartData<'doughnut'> {
    const totals = new Map<string, number>();
    for (const invoice of invoices) {
      totals.set(invoice.customerName, (totals.get(invoice.customerName) ?? 0) + invoice.amount);
    }
    const entries = [...totals.entries()].sort((a, b) => b[1] - a[1]);
    const isDark = this.themeService.isDarkMode();
    return {
      labels: entries.map(([customer]) => customer),
      datasets: [
        {
          data: entries.map(([, total]) => total),
          backgroundColor: this.doughnutColors(entries.length, isDark),
          borderColor: isDark ? '#171717' : '#ffffff',
          borderWidth: 2,
          hoverOffset: 6,
        },
      ],
    };
  }

  private doughnutColors(count: number, isDark: boolean): string[] {
    return this.preferences.colorMode() === 'informative'
      ? chartPalette(count, isDark)
      : [...MONO_PALETTE[isDark ? 'dark' : 'light']].slice(0, Math.max(count, 1));
  }

  private doughnutOptions(
    base: ChartConfiguration<'doughnut'>['options'],
    isDark: boolean,
  ): ChartConfiguration<'doughnut'>['options'] {
    return {
      ...base,
      animation: false,
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            usePointStyle: true,
            boxWidth: 8,
            color: isDark ? DASHBOARD_CHART_COLORS.darkTicks : DASHBOARD_CHART_COLORS.lightTicks,
          },
        },
        tooltip: {
          callbacks: {
            label: (context) =>
              `${context.label ?? ''}: ${this.formatCurrency(Number(context.parsed))}`,
          },
        },
      },
    };
  }

  private formatCurrency(value: number): string {
    return `${new DecimalPipe(this.language.locale()).transform(value, '1.2-2')}$`;
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
    this.loadProfit(this.profitPeriod());

    this.api.getTopProducts(5).subscribe((data) => {
      this.topProducts.set(data);
      this.productsChartSource.set({
        labels: data.map((d) => d.name),
        datasets: [
          {
            data: data.map((d) => d.total),
            backgroundColor: DASHBOARD_CHART_COLORS.neutral,
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
          },
        ],
      });
    });

    this.loading.set(false);

    this.api.getInvoiceDueSchedule('UPCOMING').subscribe((data) => {
      this.upcomingInvoices.set(data.slice(0, 10));
    });
    this.api.getInvoiceDueSchedule('OVERDUE').subscribe((data) => {
      this.overdueInvoices.set(data.slice(0, 10));
    });
  }

  onSalesPeriodChange(period: DashboardPeriod | null): void {
    if (!period) return;
    this.salesPeriod.set(period);
    this.loadSales(period);
  }

  onProfitPeriodChange(period: DashboardPeriod | null): void {
    if (!period) return;
    this.profitPeriod.set(period);
    this.loadProfit(period);
  }

  private loadProfit(period: DashboardPeriod): void {
    this.api.getProfitSummary(period).subscribe((data) => this.profitSummary.set(data));
  }

  private loadSales(period: DashboardPeriod): void {
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
    if (period === 'DAY') return this.formatDay(bucket);
    if (period === 'YEAR') return bucket;
    if (period === 'WEEK') {
      const [, week] = bucket.split('-W');
      return `${this.translations.t('analytics.dashboard.weekShort')} ${week}`;
    }
    return this.formatMonth(bucket);
  }

  private formatDay(day: string): string {
    const [year, month, date] = day.split('-').map(Number);
    return new Intl.DateTimeFormat(this.language.locale(), {
      weekday: 'short',
      day: '2-digit',
    }).format(new Date(year, month - 1, date));
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
