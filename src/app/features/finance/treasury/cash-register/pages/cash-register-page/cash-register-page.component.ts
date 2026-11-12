import { StatusSeverity } from '@shared/models/status-variant';
import { cashRegisterStatusSeverity } from '@features/finance/treasury/cash-register/models/cash-register-status.presentation';
import { LanguageService } from '@core/i18n/language.service';
import { TranslationService } from '@core/i18n/translation.service';
import { LocalizedDatePipe, LocalizedCurrencyPipe } from '@core/i18n/localized-format.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { ThemeService } from '@core/theme/components/theme-toggle/theme.service';
import { PermissionDirective } from '@features/platform/auth/authorization/directives/permission.directive';
import {
  Component,
  inject,
  OnInit,
  signal,
  computed,
  ChangeDetectionStrategy,
  DestroyRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';

import { ListContainerComponent } from '@shared/components/list/list-container/list-container.component';
import { LoadingSpinnerComponent } from '@shared/components/ui/loading-spinner/loading-spinner.component';
import { ButtonModule } from 'primeng/button';
import { Popover } from 'primeng/popover';
import { CashRegisterApplicationService } from '@features/finance/treasury/cash-register/services/application/cash-register-application.service';
import { CashRegisterOpenDialogComponent } from '@features/finance/treasury/cash-register/components/cash-register-open-dialog/cash-register-open-dialog.component';
import { CashRegisterCloseDialogComponent } from '@features/finance/treasury/cash-register/components/cash-register-close-dialog/cash-register-close-dialog.component';
import { CashRegisterSessionPickerDialogComponent } from '@features/finance/treasury/cash-register/components/cash-register-session-picker-dialog/cash-register-session-picker-dialog.component';
import { CashMovementResponse } from '@features/finance/treasury/cash-register/models/interfaces/closure.interface';
import {
  cashMovementAffectsCash,
  getCashMovementTypeLabel,
} from '@features/finance/treasury/cash-register/models/enums/cash-movement-type.enum';

import { PanelCardComponent } from '@shared/components/ui/panel-card/panel-card.component';
import { TextBadgeComponent } from '@shared/components/ui/text-badge/text-badge.component';
import { PageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';
import { MetricCardComponent } from '@shared/components/ui/metric-card/metric-card.component';

const CHART_COLORS = {
  lightSeries: '#171717',
  darkSeries: '#f5f5f5',
  lightMuted: '#a3a3a3',
  darkMuted: '#737373',
  lightTicks: '#525252',
  lightGrid: '#e5e5e5',
  darkTicks: '#d4d4d4',
  darkGrid: '#404040',
  lightFill: 'rgba(23, 23, 23, 0.12)',
  darkFill: 'rgba(245, 245, 245, 0.12)',
  incomeLight: ['#15803d', '#16a34a', '#22c55e', '#4ade80', '#86efac'],
  incomeDark: ['#86efac', '#4ade80', '#22c55e', '#16a34a', '#15803d'],
  expenseLight: ['#b91c1c', '#dc2626', '#ef4444', '#f87171', '#fca5a5'],
  expenseDark: ['#fca5a5', '#f87171', '#ef4444', '#dc2626', '#b91c1c'],
} as const;

interface MovementTypeTotal {
  type: string;
  total: number;
}

interface NonCashMovementTotal {
  type: string;
  direction: 'IN' | 'OUT';
  total: number;
}

@Component({
  selector: 'app-cash-register-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeaderComponent,
    TextBadgeComponent,
    MetricCardComponent,
    PanelCardComponent,
    TranslatePipe,
    LocalizedDatePipe,
    LocalizedCurrencyPipe,
    PermissionDirective,
    ListContainerComponent,
    LoadingSpinnerComponent,
    ButtonModule,
    Popover,
    BaseChartDirective,
    CashRegisterOpenDialogComponent,
    CashRegisterCloseDialogComponent,
    CashRegisterSessionPickerDialogComponent,
  ],
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: './cash-register-page.component.html',
})
export class CashRegisterPageComponent implements OnInit {
  private readonly service = inject(CashRegisterApplicationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly translations = inject(TranslationService);
  private readonly language = inject(LanguageService);
  private readonly theme = inject(ThemeService);

  readonly activeClosure = this.service.activeClosure;
  readonly loading = this.service.loading;

  readonly showInitialLoading = computed(() => this.service.loading() && this.closure() === null);

  readonly showEmptyState = computed(() => !this.service.loading() && this.closure() === null);

  readonly closure = computed(() => this.service.selectedClosure() ?? this.service.activeClosure());
  readonly details = computed(() => this.closure()?.details ?? []);
  readonly movements = computed<CashMovementResponse[]>(() => this.closure()?.movements ?? []);
  readonly isOpen = computed(() => this.closure()?.status === 'OPEN');
  readonly isClosed = computed(() => this.closure()?.status === 'CLOSED');

  readonly canClose = computed(() => this.isOpen());

  readonly hasPaymentBreakdown = computed(() => this.details().length > 0);
  readonly hasIncomeMovements = computed(() =>
    this.movements().some(
      (movement) => movement.direction === 'IN' && cashMovementAffectsCash(movement.type),
    ),
  );
  readonly hasExpenseMovements = computed(() =>
    this.movements().some(
      (movement) => movement.direction === 'OUT' && cashMovementAffectsCash(movement.type),
    ),
  );
  readonly nonCashMovements = computed<NonCashMovementTotal[]>(() => {
    const totals = new Map<string, NonCashMovementTotal>();
    for (const movement of this.movements()) {
      if (cashMovementAffectsCash(movement.type)) continue;
      const key = `${movement.direction}:${movement.type}`;
      const current = totals.get(key);
      totals.set(key, {
        type: movement.type,
        direction: movement.direction,
        total: (current?.total ?? 0) + Number(movement.amount),
      });
    }
    return [...totals.values()].sort((a, b) => b.total - a.total);
  });
  readonly hasNonCashMovements = computed(() => this.nonCashMovements().length > 0);

  readonly barChartType = 'bar' as const;
  readonly doughnutChartType = 'doughnut' as const;
  readonly lineChartType = 'line' as const;

  private readonly incomeByType = computed(() => this.groupMovements('IN'));

  private readonly tickColor = computed(() =>
    this.theme.isDarkMode() ? CHART_COLORS.darkTicks : CHART_COLORS.lightTicks,
  );
  private readonly gridColor = computed(() =>
    this.theme.isDarkMode() ? CHART_COLORS.darkGrid : CHART_COLORS.lightGrid,
  );

  readonly flowChartData = computed<ChartData<'bar'>>(() => {
    const closure = this.closure();
    const isDark = this.theme.isDarkMode();
    return {
      labels: [
        this.translations.t('finance.treasury.cashregister.openingBalance'),
        this.translations.t('finance.treasury.cashregister.moneyIn'),
        this.translations.t('finance.treasury.cashregister.moneyOut'),
        this.translations.t('finance.treasury.cashregister.expectedBalance'),
      ],
      datasets: [
        {
          data: closure
            ? [
                Number(closure.openingBalance),
                Number(closure.totalIncome),
                Number(closure.totalExpense),
                Number(closure.expectedBalance),
              ]
            : [],
          backgroundColor: [
            isDark ? CHART_COLORS.darkMuted : CHART_COLORS.lightMuted,
            isDark ? '#86efac' : '#15803d',
            isDark ? '#fca5a5' : '#b91c1c',
            isDark ? CHART_COLORS.darkSeries : CHART_COLORS.lightSeries,
          ],
          borderRadius: 8,
          maxBarThickness: 64,
        },
      ],
    };
  });

  readonly flowChartOptions = computed<ChartConfiguration<'bar'>['options']>(() => {
    const ticks = this.tickColor();
    const grid = this.gridColor();
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: { label: (context) => ` ${this.formatCurrency(Number(context.raw))}` },
        },
      },
      scales: {
        x: {
          ticks: { color: ticks },
          grid: { display: false },
          border: { color: grid },
        },
        y: {
          beginAtZero: true,
          ticks: { color: ticks, callback: (value) => this.formatCurrency(Number(value)) },
          grid: { color: grid },
          border: { color: grid },
        },
      },
    };
  });

  readonly incomeByTypeChartData = computed<ChartData<'doughnut'>>(() => {
    const rows = this.incomeByType();
    const colors = this.theme.isDarkMode() ? CHART_COLORS.incomeDark : CHART_COLORS.incomeLight;
    return {
      labels: rows.map((row) => this.translations.t(getCashMovementTypeLabel(row.type))),
      datasets: [
        {
          data: rows.map((row) => row.total),
          backgroundColor: rows.map((_, index) => colors[index % colors.length]),
          borderWidth: 0,
          hoverOffset: 6,
        },
      ],
    };
  });

  readonly expenseByTypeChartData = computed<ChartData<'doughnut'>>(() => {
    const rows = this.closure()?.expenseSummary ?? [];
    const colors = this.theme.isDarkMode() ? CHART_COLORS.expenseDark : CHART_COLORS.expenseLight;
    return {
      labels: rows.map((row) => row.concept),
      datasets: [
        {
          data: rows.map((row) => Number(row.total)),
          backgroundColor: rows.map((_, index) => colors[index % colors.length]),
          borderWidth: 0,
          hoverOffset: 6,
        },
      ],
    };
  });

  readonly doughnutChartOptions = computed<ChartConfiguration<'doughnut'>['options']>(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    cutout: '62%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: this.tickColor(),
          usePointStyle: true,
          boxWidth: 8,
          padding: 14,
        },
      },
      tooltip: {
        callbacks: { label: (context) => ` ${this.formatCurrency(Number(context.parsed))}` },
      },
    },
  }));

  readonly paymentBreakdownChartData = computed<ChartData<'bar'>>(() => {
    const isDark = this.theme.isDarkMode();
    return {
      labels: this.details().map((detail) => detail.paymentMethodName),
      datasets: [
        {
          data: this.details().map((detail) => Number(detail.expectedAmount)),
          backgroundColor: isDark ? '#86efac' : '#15803d',
          borderRadius: 8,
          maxBarThickness: 24,
        },
      ],
    };
  });

  readonly paymentBreakdownChartOptions = computed<ChartConfiguration<'bar'>['options']>(() => {
    const ticks = this.tickColor();
    const grid = this.gridColor();
    return {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: { label: (context) => ` ${this.formatCurrency(Number(context.raw))}` },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: { color: ticks, callback: (value) => this.formatCurrency(Number(value)) },
          grid: { color: grid },
          border: { color: grid },
        },
        y: {
          ticks: { color: ticks, font: { size: 12 } },
          grid: { display: false },
          border: { color: grid },
        },
      },
    };
  });

  readonly balanceTimelineChartData = computed<ChartData<'line'>>(() => {
    const closure = this.closure();
    if (!closure) return { labels: [], datasets: [] };
    const isDark = this.theme.isDarkMode();
    const color = isDark ? CHART_COLORS.darkSeries : CHART_COLORS.lightSeries;
    const order = [...this.movements()]
      .filter((movement) => cashMovementAffectsCash(movement.type))
      .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
    let running = Number(closure.openingBalance);
    const labels = [this.translations.t('finance.treasury.cashregister.openingBalance')];
    const values = [running];
    for (const movement of order) {
      running += (movement.direction === 'IN' ? 1 : -1) * Number(movement.amount);
      labels.push(this.formatTime(movement.occurredAt));
      values.push(running);
    }
    return {
      labels,
      datasets: [
        {
          data: values,
          borderColor: color,
          backgroundColor: isDark ? CHART_COLORS.darkFill : CHART_COLORS.lightFill,
          fill: true,
          tension: 0.35,
          pointRadius: 3,
          pointBackgroundColor: color,
        },
      ],
    };
  });

  readonly balanceTimelineChartOptions = computed<ChartConfiguration<'line'>['options']>(() => {
    const ticks = this.tickColor();
    const grid = this.gridColor();
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      interaction: { intersect: false, mode: 'index' },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: { label: (context) => ` ${this.formatCurrency(Number(context.parsed.y))}` },
        },
      },
      scales: {
        x: {
          ticks: { color: ticks, maxRotation: 0, autoSkip: true },
          grid: { display: false },
          border: { color: grid },
        },
        y: {
          ticks: { color: ticks, callback: (value) => this.formatCurrency(Number(value)) },
          grid: { color: grid },
          border: { color: grid },
        },
      },
    };
  });

  readonly openDialogVisible = signal(false);
  readonly closeDialogVisible = signal(false);
  readonly sessionPickerVisible = signal(false);

  ngOnInit(): void {
    this.service
      .loadActiveClosure()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        const sessionId = this.route.snapshot.queryParamMap.get('session');
        if (sessionId && sessionId !== this.service.activeClosure()?.id) {
          this.service.loadSession(sessionId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
        }
      });
  }

  onOpenDialogOpen(): void {
    this.openDialogVisible.set(true);
  }

  onOpenCloseDialog(): void {
    this.closeDialogVisible.set(true);
  }

  onOpenSessionPicker(): void {
    this.sessionPickerVisible.set(true);
  }

  onSelectSession(id: string): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { session: id },
      queryParamsHandling: 'merge',
    });

    if (id === this.service.activeClosure()?.id) {
      this.service.clearSelectedClosure();
      return;
    }

    this.service.loadSession(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  onViewHistory(): void {
    this.router.navigate(['/finance/treasury/cash-register/history']);
  }

  getStatusLabel(status: string | undefined): string {
    switch (status) {
      case 'OPEN':
        return 'finance.treasury.cashregister.statusOpen';
      case 'CLOSED':
        return 'finance.treasury.cashregister.statusClosed';
      case 'VERIFIED':
        return 'finance.treasury.cashregister.statusVerified';
      default:
        return status ?? '';
    }
  }

  getStatusSeverity(status: string | undefined): StatusSeverity {
    return cashRegisterStatusSeverity(status);
  }

  getMovementTypeLabel(type: string): string {
    return getCashMovementTypeLabel(type);
  }

  private groupMovements(direction: 'IN' | 'OUT'): MovementTypeTotal[] {
    const totals = new Map<string, number>();
    for (const movement of this.movements()) {
      if (movement.direction !== direction || !cashMovementAffectsCash(movement.type)) continue;
      totals.set(movement.type, (totals.get(movement.type) ?? 0) + Number(movement.amount));
    }
    return [...totals.entries()]
      .map(([type, total]) => ({ type, total }))
      .sort((a, b) => b.total - a.total);
  }

  private formatCurrency(value: number): string {
    return `${Number(value).toLocaleString(this.language.locale(), {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}$`;
  }

  private formatTime(value: string): string {
    return new Intl.DateTimeFormat(this.language.locale(), {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  }
}
