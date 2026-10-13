import { Component, inject, signal, effect, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ThemeService } from '@core/theme/components/theme-toggle/theme.service';
import {
  DashboardApiService,
  DashboardSummary,
  MonthlySales,
  TopItem,
  RecentActivity,
  InvoiceDue,
} from '@features/dashboard/services/api/dashboard-api.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';

const DASHBOARD_CHART_COLORS = {
  neutral: '#777777',
  overdue: '#ef4444',
  overdueFill: 'rgba(239, 68, 68, 0.14)',
  lightTicks: '#525252',
  lightGrid: '#e5e5e5',
  darkTicks: '#d4d4d4',
  darkGrid: '#404040',
} as const;

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DecimalPipe, BaseChartDirective],
  templateUrl: './dashboard-page.component.html',
})
export class DashboardPageComponent implements OnInit {
  private readonly api = inject(DashboardApiService);
  private readonly themeService = inject(ThemeService);

  readonly summary = signal<DashboardSummary | null>(null);
  readonly monthlySales = signal<MonthlySales[]>([]);
  readonly topProducts = signal<TopItem[]>([]);
  readonly topCustomers = signal<TopItem[]>([]);
  readonly recentActivity = signal<RecentActivity[]>([]);
  readonly invoiceDueSchedule = signal<InvoiceDue[]>([]);
  readonly loading = signal(true);

  readonly barChartType = 'bar' as const;
  readonly horizontalBarChartType = 'bar' as const;
  readonly lineChartType = 'line' as const;

  salesChartData = signal<ChartData<'bar'>>({ labels: [], datasets: [] });
  salesChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { callback: (v) => '$' + (v as number).toLocaleString() } },
    },
  };

  productsChartData = signal<ChartData<'bar'>>({ labels: [], datasets: [] });
  productsChartOptions: ChartConfiguration<'bar'>['options'] = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { beginAtZero: true, ticks: { callback: (v) => '$' + (v as number).toLocaleString() } },
      y: { ticks: { font: { size: 11 } } },
    },
  };

  customersChartData = signal<ChartData<'bar'>>({ labels: [], datasets: [] });
  customersChartOptions: ChartConfiguration<'bar'>['options'] = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { beginAtZero: true, ticks: { callback: (v) => '$' + (v as number).toLocaleString() } },
      y: { ticks: { font: { size: 11 } } },
    },
  };

  dueChartData = signal<ChartData<'line'>>({ labels: [], datasets: [] });
  dueChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: 'index' },
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { callback: (v) => '$' + Number(v).toLocaleString() } },
    },
  };

  constructor() {
    effect(() => {
      const isDark = this.themeService.isDarkMode();
      this.salesChartOptions = {
        ...this.salesChartOptions,
        scales: this.themedScales(this.salesChartOptions?.scales, isDark),
      };
      this.productsChartOptions = {
        ...this.productsChartOptions,
        scales: this.themedScales(this.productsChartOptions?.scales, isDark),
      };
      this.customersChartOptions = {
        ...this.customersChartOptions,
        scales: this.themedScales(this.customersChartOptions?.scales, isDark),
      };
      this.dueChartOptions = {
        ...this.dueChartOptions,
        scales: this.themedScales(this.dueChartOptions?.scales, isDark),
      };
    });
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

    this.api.getMonthlySales().subscribe((data) => {
      this.monthlySales.set(data);
      this.salesChartData.set({
        labels: data.map((d) => this.formatMonth(d.month)),
        datasets: [
          {
            data: data.map((d) => d.total),
            backgroundColor: DASHBOARD_CHART_COLORS.neutral,
            borderRadius: 6,
          },
        ],
      });
    });

    this.api.getTopProducts(5).subscribe((data) => {
      this.topProducts.set(data);
      this.productsChartData.set({
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
      this.customersChartData.set({
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

    this.api.getRecentActivity().subscribe((data) => {
      this.recentActivity.set(data);
      this.loading.set(false);
    });

    this.api.getInvoiceDueSchedule().subscribe((data) => {
      const limitedSchedule = data.slice(0, 10);
      this.invoiceDueSchedule.set(limitedSchedule);
      const byDate = new Map<string, number>();
      for (const invoice of limitedSchedule) {
        byDate.set(invoice.dueDate, (byDate.get(invoice.dueDate) ?? 0) + invoice.amount);
      }
      const dates = [...byDate.keys()].sort();
      this.dueChartData.set({
        labels: dates.map((date) => this.formatDate(date)),
        datasets: [
          {
            data: dates.map((date) => byDate.get(date) ?? 0),
            borderColor: DASHBOARD_CHART_COLORS.overdue,
            backgroundColor: DASHBOARD_CHART_COLORS.overdueFill,
            fill: true,
            tension: 0.3,
            pointRadius: 4,
            pointBackgroundColor: DASHBOARD_CHART_COLORS.overdue,
          },
        ],
      });
    });
  }

  activityLabel(type: string): string {
    const labels: Record<string, string> = { invoice: 'Factura', order: 'Pedido' };
    return labels[type] ?? type;
  }

  private formatMonth(month: string): string {
    const months = [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ];
    const [year, m] = month.split('-');
    const monthIndex = parseInt(m, 10) - 1;
    return months[monthIndex] + ' ' + year;
  }

  formatDueDate(date: string): string {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(`${date}T00:00:00`));
  }

  isOverdue(date: string): boolean {
    return date < new Date().toISOString().slice(0, 10);
  }

  private formatDate(date: string): string {
    return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short' }).format(
      new Date(`${date}T00:00:00`),
    );
  }
}
