import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { MainLayoutComponent } from '@core/layouts/main-layout.component';
import { DashboardApiService, DashboardSummary, MonthlySales, TopItem, RecentActivity } from '@features/dashboard/services/api/dashboard-api.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DecimalPipe, DatePipe, MainLayoutComponent, BaseChartDirective],
  templateUrl: './dashboard-page.component.html',
})
export class DashboardPageComponent implements OnInit {
  private readonly api = inject(DashboardApiService);

  readonly summary = signal<DashboardSummary | null>(null);
  readonly monthlySales = signal<MonthlySales[]>([]);
  readonly topProducts = signal<TopItem[]>([]);
  readonly topCustomers = signal<TopItem[]>([]);
  readonly recentActivity = signal<RecentActivity[]>([]);
  readonly loading = signal(true);

  readonly barChartType: ChartType = 'bar';
  readonly horizontalBarChartType: ChartType = 'bar';

  salesChartData = signal<ChartData<'bar'>>({ labels: [], datasets: [] });
  salesChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { callback: (v) => '$' + (v as number).toLocaleString() } } },
  };

  productsChartData = signal<ChartData<'bar'>>({ labels: [], datasets: [] });
  productsChartOptions: ChartConfiguration['options'] = {
    indexAxis: 'y',
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { x: { beginAtZero: true, ticks: { callback: (v) => '$' + (v as number).toLocaleString() } } },
  };

  customersChartData = signal<ChartData<'bar'>>({ labels: [], datasets: [] });
  customersChartOptions: ChartConfiguration['options'] = {
    indexAxis: 'y',
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { x: { beginAtZero: true, ticks: { callback: (v) => '$' + (v as number).toLocaleString() } } },
  };

  ngOnInit(): void {
    this.api.getSummary().subscribe((s) => this.summary.set(s));

    this.api.getMonthlySales().subscribe((data) => {
      this.monthlySales.set(data);
      this.salesChartData.set({
        labels: data.map((d) => d.month),
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
  }

  activityLabel(type: string): string {
    const labels: Record<string, string> = { invoice: 'Factura', order: 'Pedido' };
    return labels[type] ?? type;
  }
}
