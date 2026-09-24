import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import {
  DashboardApiService,
  DashboardSummary,
  MonthlySales,
  TopItem,
  RecentActivity,
  InvoiceDue,
} from '@features/dashboard/services/api/dashboard-api.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DecimalPipe, BaseChartDirective],
  templateUrl: './dashboard-page.component.html',
})
export class DashboardPageComponent implements OnInit {
  private readonly api = inject(DashboardApiService);

  readonly summary = signal<DashboardSummary | null>(null);
  readonly monthlySales = signal<MonthlySales[]>([]);
  readonly topProducts = signal<TopItem[]>([]);
  readonly topCustomers = signal<TopItem[]>([]);
  readonly recentActivity = signal<RecentActivity[]>([]);
  readonly invoiceDueSchedule = signal<InvoiceDue[]>([]);
  readonly loading = signal(true);

  readonly barChartType: ChartType = 'bar';
  readonly horizontalBarChartType: ChartType = 'bar';
  readonly lineChartType = 'line' as const;

  salesChartData = signal<ChartData<'bar'>>({ labels: [], datasets: [] });
  salesChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { callback: (v) => '$' + (v as number).toLocaleString() } },
    },
  };

  productsChartData = signal<ChartData<'bar'>>({ labels: [], datasets: [] });
  productsChartOptions: ChartConfiguration['options'] = {
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
  customersChartOptions: ChartConfiguration['options'] = {
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

  ngOnInit(): void {
    this.api.getSummary().subscribe((s) => this.summary.set(s));

    this.api.getMonthlySales().subscribe((data) => {
      this.monthlySales.set(data);
      this.salesChartData.set({
        labels: data.map((d) => this.formatMonth(d.month)),
        datasets: [{ data: data.map((d) => d.total), backgroundColor: '#2196F3', borderRadius: 6 }],
      });
    });

    this.api.getTopProducts(5).subscribe((data) => {
      this.topProducts.set(data);
      this.productsChartData.set({
        labels: data.map((d) => d.name),
        datasets: [{ data: data.map((d) => d.total), backgroundColor: '#4CAF50', borderRadius: 6 }],
      });
    });

    this.api.getTopCustomers(5).subscribe((data) => {
      this.topCustomers.set(data);
      this.customersChartData.set({
        labels: data.map((d) => d.name),
        datasets: [{ data: data.map((d) => d.total), backgroundColor: '#FF9800', borderRadius: 6 }],
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
        datasets: [{
          data: dates.map((date) => byDate.get(date) ?? 0),
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.14)',
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: '#ef4444',
        }],
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
    return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(`${date}T00:00:00`));
  }

  isOverdue(date: string): boolean {
    return date < new Date().toISOString().slice(0, 10);
  }

  private formatDate(date: string): string {
    return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short' }).format(new Date(`${date}T00:00:00`));
  }
}
