import {
  Component,
  input,
  viewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { CashRegisterResponse } from '../../models/interfaces/closure.interface';

Chart.register(...registerables);

@Component({
  selector: 'app-cash-register-charts',
  standalone: true,
  templateUrl: './cash-register-charts.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashRegisterChartsComponent implements AfterViewInit, OnDestroy {
  readonly closure = input.required<CashRegisterResponse>();

  readonly barCanvas = viewChild.required<ElementRef<HTMLCanvasElement>>('barCanvas');
  readonly doughnutCanvas = viewChild.required<ElementRef<HTMLCanvasElement>>('doughnutCanvas');

  private barChart: Chart | null = null;
  private doughnutChart: Chart | null = null;

  ngAfterViewInit(): void {
    this.createBarChart();
    this.createDoughnutChart();
  }

  ngOnDestroy(): void {
    this.barChart?.destroy();
    this.doughnutChart?.destroy();
  }

  private createBarChart(): void {
    const c = this.closure();
    const ctx = this.barCanvas().nativeElement;

    this.barChart?.destroy();
    this.barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Facturado', 'Ingresado', 'Gastado', 'Balance'],
        datasets: [
          {
            label: 'Monto',
            data: [c.totalInvoiced, c.totalRevenue, c.totalExpenses, c.balance],
            backgroundColor: [
              '#3b82f6',
              '#22c55e',
              '#ef4444',
              c.balance >= 0 ? '#22c55e' : '#ef4444',
            ],
            borderRadius: 6,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const value = ctx.parsed.y ?? 0;
                return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.06)' },
            ticks: {
              callback: (value) => `$${(value as number).toLocaleString()}`,
            },
          },
          x: {
            grid: { display: false },
          },
        },
      },
    });
  }

  private createDoughnutChart(): void {
    const c = this.closure();
    const ctx = this.doughnutCanvas().nativeElement;

    this.doughnutChart?.destroy();
    this.doughnutChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Pagos', 'Anticipos', 'Devoluciones', 'Facturas'],
        datasets: [
          {
            data: [c.totalPayments, c.totalAdvances, c.totalReturns, c.totalInvoices],
            backgroundColor: ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6'],
            borderWidth: 2,
            borderColor: 'rgba(255,255,255,0.8)',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 16,
              font: { size: 12 },
            },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const total = (ctx.dataset.data as number[]).reduce((a, b) => a + b, 0);
                const value = ctx.parsed;
                const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                return `${ctx.label}: $${value.toLocaleString('en-US', { minimumFractionDigits: 2 })} (${pct}%)`;
              },
            },
          },
        },
      },
    });
  }
}
