import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { DatePickerModule } from 'primeng/datepicker';
import { TooltipModule } from 'primeng/tooltip';
import { PaginatorState } from 'primeng/paginator';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { LanguageService } from '@core/i18n/language.service';
import { TranslationService } from '@core/i18n/translation.service';
import { LoadingSpinnerComponent } from '@shared/components/ui/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '@shared/components/ui/empty-state/empty-state.component';
import { PaginatorComponent } from '@shared/components/ui/paginator/paginator.component';
import { FilterFieldComponent } from '@shared/components/ui/filter-field/filter-field.component';
import { ListFilterComponent } from '@shared/components/list/list-filter/list-filter.component';
import { AuditTrailDialogService } from '@shared/services/audit-trail-dialog.service';
import { AuditAction, AuditFilters, AuditTrailRequest } from '@features/platform/audit/models';
import { AuditTrailService } from '@features/platform/audit/services/application';
import { AuditTrailListComponent } from '@features/platform/audit/components/audit-trail-list/audit-trail-list.component';

interface AuditOption<T> {
  label: string;
  value: T;
}

@Component({
  selector: 'app-audit-trail-dialog',
  standalone: true,
  imports: [
    FormsModule,
    DialogModule,
    ButtonModule,
    SelectModule,
    MultiSelectModule,
    DatePickerModule,
    TooltipModule,
    TranslatePipe,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    PaginatorComponent,
    FilterFieldComponent,
    ListFilterComponent,
    AuditTrailListComponent,
  ],
  templateUrl: './audit-trail-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuditTrailDialogComponent implements OnInit {
  private readonly translations = inject(TranslationService);
  private readonly dialogService = inject(AuditTrailDialogService);
  private readonly dateChanges = new Subject<Partial<AuditFilters>>();

  readonly trail = inject(AuditTrailService);
  readonly locale = inject(LanguageService).locale;
  readonly request = input.required<AuditTrailRequest>();

  readonly visible = signal(true);
  readonly selectedActions = signal<AuditAction[]>([]);
  readonly selectedActorId = signal<string | null>(null);
  readonly fromDate = signal<Date | null>(null);
  readonly toDate = signal<Date | null>(null);

  readonly activeFilterCount = computed(() => {
    const filters = this.trail.filters();
    return (
      (filters.action?.length ? 1 : 0) +
      (filters.actorId ? 1 : 0) +
      (filters.from ? 1 : 0) +
      (filters.to ? 1 : 0)
    );
  });

  readonly actionOptions = computed<AuditOption<AuditAction>[]>(() =>
    (this.trail.filterOptions()?.actions ?? []).map((action) => ({
      label: this.translations.t(action.labelKey),
      value: action.value,
    })),
  );

  readonly actorOptions = computed<AuditOption<string>[]>(() =>
    (this.trail.filterOptions()?.actors ?? [])
      .filter(
        (actor): actor is { id: string; name: string; photoUrl: string | null; count: number } =>
          typeof actor.id === 'string',
      )
      .map((actor) => ({ label: actor.name, value: actor.id })),
  );

  readonly minDate = computed(() => this.parseDate(this.trail.filterOptions()?.dateRange?.min));
  readonly maxDate = computed(() => this.parseDate(this.trail.filterOptions()?.dateRange?.max));

  readonly pageReportTemplate = computed(() => `{first} - {last} / {totalRecords}`);

  constructor() {
    this.dateChanges
      .pipe(debounceTime(300), takeUntilDestroyed())
      .subscribe((partial) => this.trail.applyFilters(partial));
  }

  ngOnInit(): void {
    this.trail.open(this.request());
  }

  close(): void {
    this.visible.set(false);
  }

  onHidden(): void {
    this.dialogService.close();
  }

  onActionsChange(value: AuditAction[] | null): void {
    const actions = value ?? [];
    this.selectedActions.set(actions);
    this.trail.applyFilters({ action: actions.length > 0 ? actions : undefined });
  }

  onActorChange(value: string | null): void {
    this.selectedActorId.set(value);
    this.trail.applyFilters({ actorId: value ?? undefined });
  }

  onFromChange(value: Date | null): void {
    this.fromDate.set(value);
    this.dateChanges.next({ from: value ? this.toDateParameter(value) : undefined });
  }

  onToChange(value: Date | null): void {
    this.toDate.set(value);
    this.dateChanges.next({ to: value ? this.toDateParameter(value) : undefined });
  }

  clearFilters(): void {
    this.selectedActions.set([]);
    this.selectedActorId.set(null);
    this.fromDate.set(null);
    this.toDate.set(null);
    this.trail.clearFilters();
  }

  onPageChange(state: PaginatorState): void {
    const rows = state.rows ?? this.trail.filters().size;
    if (rows !== this.trail.filters().size) {
      this.trail.applyFilters({ size: rows });
      return;
    }
    this.trail.goToPage(state.page ?? 0);
  }

  private toDateParameter(value: Date): string {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private parseDate(value: string | null | undefined): Date | null {
    return value ? new Date(value) : null;
  }
}
