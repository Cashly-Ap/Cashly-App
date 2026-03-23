import {
  Directive,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
  DestroyRef,
} from '@angular/core';
import { FormBuilder, FormGroup, FormArray, ValidatorFn } from '@angular/forms';
import { ActivatedRoute, Router, NavigationStart } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  Subject,
  takeUntil,
} from 'rxjs';
import { FormMode } from '../enums/form-mode.enum';
import { PendingTabsService } from '@core/pending-tabs';
import { PENDING_TABS_CONFIG } from '@core/pending-tabs/constants';

export interface ArrayItemConfig {
  field: string;
  validators: ValidatorFn[];
  defaults?: Record<string, unknown>;
}

export interface FormConfig<TArrayField extends string = string> {
  entityDisplayName: string;
  entityArticle: string;
  module: string;
  routeBase: string;
  createPath?: string;
  arrayConfigs?: Record<TArrayField, ArrayItemConfig>;
}

@Directive()
export abstract class BaseFormComponent<T> implements OnInit, OnDestroy {
  protected fb = inject(FormBuilder);
  protected route = inject(ActivatedRoute);
  protected router = inject(Router);
  protected pendingTabsService = inject(PendingTabsService);
  protected destroyRef = inject(DestroyRef);

  mode = signal<FormMode>(FormMode.CREATE);
  entityId = signal<string | null>(null);
  protected tabId = signal<string>('');
  private isSubmitted = signal(false);
  private formAutoSaveDestroy$ = new Subject<void>();

  form!: FormGroup;

  title = computed(() =>
    this.mode() === FormMode.CREATE
      ? `Nuevo ${this.getConfig().entityDisplayName}`
      : `Editar ${this.getConfig().entityDisplayName}`,
  );

  subtitle = computed(() =>
    this.mode() === FormMode.CREATE
      ? `Complete la información ${this.getConfig().entityArticle} ${this.getConfig().entityDisplayName.toLowerCase()}`
      : `Actualice la información ${this.getConfig().entityArticle} ${this.getConfig().entityDisplayName.toLowerCase()}`,
  );

  submitLabel = computed(() =>
    this.mode() === FormMode.CREATE
      ? `Crear ${this.getConfig().entityDisplayName}`
      : `Actualizar ${this.getConfig().entityDisplayName}`,
  );

  abstract getConfig(): FormConfig;
  abstract createForm(): FormGroup;

  ngOnInit(): void {
    this.setupRouteParamSubscription();
    this.setupNavigationAutoSave();
  }

  private setupRouteParamSubscription(): void {
    this.route.paramMap
      .pipe(
        map((params) => params.get('id')),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((id) => {
        this.reinitializeForm(id);
      });
  }

  private reinitializeForm(id: string | null): void {
    this.formAutoSaveDestroy$.next();
    this.mode.set(id ? FormMode.EDIT : FormMode.CREATE);
    this.entityId.set(id);
    this.initializeTabId();
    this.form = this.createForm();
    this.setupAutoSave();
    this.loadPendingOrEntity();
  }

  ngOnDestroy(): void {
    if (this.form?.dirty && !this.isSubmitted()) {
      this.savePendingTab();
    }
  }

  private initializeTabId(): void {
    const config = this.getConfig();
    if (this.isCreateMode()) {
      const queryTabId = this.route.snapshot.queryParamMap.get('tabId');
      this.tabId.set(queryTabId || `${config.module}-create-${Date.now()}`);
    } else {
      this.tabId.set(`${config.module}-edit-${this.entityId()}`);
    }
  }

  private loadPendingOrEntity(): void {
    const pendingTab = this.pendingTabsService.get<T>(this.tabId());

    if (pendingTab) {
      this.restoreFormData(pendingTab.formData);
    } else if (this.isEditMode() && this.entityId()) {
      this.onLoadEntity(this.entityId()!);
    }
  }

  private setupAutoSave(): void {
    this.form.valueChanges
      .pipe(
        debounceTime(PENDING_TABS_CONFIG.DEBOUNCE_TIME),
        filter(() => this.form.dirty && !this.isSubmitted()),
        takeUntil(this.formAutoSaveDestroy$),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.savePendingTab());
  }

  private setupNavigationAutoSave(): void {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationStart),
        filter(() => this.form.dirty && !this.isSubmitted()),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.savePendingTab());
  }

  private savePendingTab(): void {
    const config = this.getConfig();
    const formData = this.form.getRawValue() as T;
    const title = this.getPendingTabTitle(formData);
    const route = this.getPendingTabRoute();

    this.pendingTabsService.save(
      this.tabId(),
      title,
      route,
      formData,
      this.isCreateMode() ? 'create' : 'edit',
      config.module,
    );
  }

  protected getPendingTabTitle(_formData: T): string {
    const config = this.getConfig();
    return this.isCreateMode()
      ? `Nuevo ${config.entityDisplayName}`
      : `Editar ${config.entityDisplayName}`;
  }

  private getPendingTabRoute(): string {
    const config = this.getConfig();
    if (this.isCreateMode()) {
      const createPath = config.createPath ?? 'new';
      return `${config.routeBase}/${createPath}?tabId=${this.tabId()}`;
    }
    return `${config.routeBase}/${this.entityId()}/edit`;
  }

  protected markAsSubmitted(): void {
    this.isSubmitted.set(true);
    this.pendingTabsService.remove(this.tabId());
  }

  protected onLoadEntity(_id: string): void {}

  protected restoreFormData(_data: T): void {}

  onSubmit(): void {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }
  }

  onCancel(): void {
    this.router.navigate([this.getConfig().routeBase]);
  }

  isEditMode(): boolean {
    return this.mode() === FormMode.EDIT;
  }

  isCreateMode(): boolean {
    return this.mode() === FormMode.CREATE;
  }

  array(field: string): FormArray {
    return this.form.get(field) as FormArray;
  }

  addArrayItem(field: string): void {
    const config = this.getConfig().arrayConfigs?.[field];
    if (!config) {
      return;
    }
    this.array(field).push(this.createArrayItemGroup(config));
  }

  removeArrayItem(field: string, index: number): void {
    this.array(field).removeAt(index);
  }

  protected populateArray<TItem extends object>(
    field: string,
    items?: TItem[],
  ): void {
    const config = this.getConfig().arrayConfigs?.[field];
    if (!config) {
      return;
    }
    const formArray = this.array(field);
    formArray.clear();
    items?.forEach((item) =>
      formArray.push(
        this.createArrayItemGroup(config, item as Record<string, unknown>),
      ),
    );
  }

  private createArrayItemGroup(
    config: ArrayItemConfig,
    data?: Record<string, unknown>,
  ): FormGroup {
    const group: Record<string, unknown> = {};

    if (data?.['id'] !== undefined) {
      group['id'] = [data['id']];
    }
    if (data?.['customerId'] !== undefined) {
      group['customerId'] = [data['customerId']];
    }

    group[config.field] = [data?.[config.field] ?? '', config.validators];

    if (config.defaults) {
      Object.entries(config.defaults).forEach(([key, defaultValue]) => {
        group[key] = [data?.[key] ?? defaultValue];
      });
    }

    return this.fb.group(group);
  }
}
