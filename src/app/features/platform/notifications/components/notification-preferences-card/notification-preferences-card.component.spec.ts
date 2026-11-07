import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationPreferencesCardComponent } from '@features/platform/notifications/components/notification-preferences-card/notification-preferences-card.component';
import { NotificationPreferencesService } from '@features/platform/notifications/services/state/notification-preferences.service';
import { NotificationModulePreference } from '@features/platform/notifications/models/notification-preferences.model';

describe('NotificationPreferencesCardComponent', () => {
  const modules = signal<NotificationModulePreference[]>([
    { module: 'SALES_QUOTES', labelKey: 'navigation.labels.quotes', enabled: true },
    { module: 'CONTACTS_CUSTOMERS', labelKey: 'navigation.labels.customers', enabled: true },
  ]);
  const preferences = {
    loading: signal(false),
    saving: signal(false),
    error: signal<string | null>(null),
    ready: signal(true),
    enabled: signal(true),
    modules,
    setEnabled: vi.fn(),
    setModuleEnabled: vi.fn(),
    retry: vi.fn(),
  };
  let fixture: ComponentFixture<NotificationPreferencesCardComponent>;
  let component: NotificationPreferencesCardComponent;

  beforeEach(() => {
    vi.clearAllMocks();
    preferences.loading.set(false);
    preferences.saving.set(false);
    preferences.error.set(null);
    preferences.ready.set(true);
    preferences.enabled.set(true);
    modules.set([
      { module: 'SALES_QUOTES', labelKey: 'navigation.labels.quotes', enabled: true },
      { module: 'CONTACTS_CUSTOMERS', labelKey: 'navigation.labels.customers', enabled: true },
    ]);
    TestBed.configureTestingModule({
      imports: [NotificationPreferencesCardComponent],
      providers: [{ provide: NotificationPreferencesService, useValue: preferences }],
    });
    fixture = TestBed.createComponent(NotificationPreferencesCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders only the modules returned by the backend with translated labels', () => {
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelectorAll('[data-testid^="notification-preferences-module-"]')).toHaveLength(
      2,
    );
    expect(root.textContent).toContain('Presupuestos');
    expect(root.textContent).toContain('Clientes');
  });

  it('organizes modules under translated main groups', () => {
    modules.set([
      {
        module: 'FINANCE_BILLING_CREDIT_NOTES',
        labelKey: 'platform.auth.domains.finance_billing_credit_notes',
        enabled: true,
      },
      {
        module: 'FINANCE_TREASURY_CASH_REGISTER',
        labelKey: 'platform.auth.domains.finance_treasury_cash_register',
        enabled: true,
      },
    ]);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const text = root.textContent ?? '';

    expect(text).toContain('Finanzas');
    expect(text).toContain('Facturación');
    expect(text).toContain('Notas de crédito');
    expect(text).toContain('Tesorería');
    expect(text).toContain('Caja');
    expect(root.querySelectorAll('div.space-y-3 > h3')).toHaveLength(1);
  });

  it('disables module switches when the master switch is off', () => {
    preferences.enabled.set(false);
    fixture.detectChanges();

    const master = fixture.nativeElement.querySelector(
      '[data-testid="notification-preferences-master"]',
    ) as HTMLInputElement;
    const module = fixture.nativeElement.querySelector(
      '[data-testid="notification-preferences-module-SALES_QUOTES"]',
    ) as HTMLInputElement;
    expect(master.checked).toBe(false);
    expect(module.disabled).toBe(true);
  });

  it('filters the configuration catalog by module and submodule', () => {
    modules.set([
      { module: 'FINANCE_BILLING_INVOICES', labelKey: 'navigation.labels.invoices', enabled: true },
      {
        module: 'FINANCE_TREASURY_CASH_REGISTER',
        labelKey: 'navigation.labels.cashRegister',
        enabled: true,
      },
      { module: 'CONTACTS_CUSTOMERS', labelKey: 'navigation.labels.customers', enabled: true },
    ]);
    fixture.detectChanges();

    component.selectedArea.set('navigation.labels.finance');
    expect(component.filteredCatalog().map((area) => area.areaKey)).toEqual([
      'navigation.labels.finance',
    ]);
    expect(
      component.filteredCatalog()[0].sections.flatMap((section) => section.modules),
    ).toHaveLength(2);

    component.selectedModule.set('navigation.labels.invoices');
    expect(
      component.filteredCatalog()[0].sections.flatMap((section) => section.modules),
    ).toHaveLength(1);
    expect(component.filteredCatalog()[0].sections[0].modules[0].labelKey).toBe(
      'navigation.labels.invoices',
    );
  });

  it('clears a submodule when it is not available in the selected module', () => {
    component.selectedModule.set('navigation.labels.quotes');

    component.setArea('navigation.labels.finance');

    expect(component.selectedModule()).toBeNull();
  });

  it('toggles the master switch and module switches', () => {
    const root = fixture.nativeElement as HTMLElement;
    root
      .querySelector<HTMLInputElement>('[data-testid="notification-preferences-master"]')!
      .click();
    root
      .querySelector<HTMLInputElement>(
        '[data-testid="notification-preferences-module-SALES_QUOTES"]',
      )!
      .click();

    expect(preferences.setEnabled).toHaveBeenCalledWith(false);
    expect(preferences.setModuleEnabled).toHaveBeenCalledWith('SALES_QUOTES', false);
  });

  it('shows the empty state when there are no eligible modules', () => {
    modules.set([]);
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('[data-testid="notification-preferences-empty"]'),
    ).not.toBeNull();
  });

  it('shows the load error and retries', () => {
    preferences.error.set('platform.notifications.preferences.loadError');
    fixture.detectChanges();

    const alert = fixture.nativeElement.querySelector(
      '[data-testid="notification-preferences-error"]',
    ) as HTMLElement;
    expect(alert.textContent).toContain('No se pudieron cargar');
    (alert.querySelector('button') as HTMLButtonElement).click();
    expect(preferences.retry).toHaveBeenCalledOnce();
  });
});
