import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NO_ERRORS_SCHEMA, Component } from '@angular/core';
import { of, throwError } from 'rxjs';
import { CustomerPickerDialogComponent } from '@features/orders/components/customer-picker-dialog/customer-picker-dialog.component';
import { CustomerApiService } from '@features/customers/services/api/customer-api.service';
import { CustomerList } from '@features/customers/models/interfaces';
import { CustomerType } from '@features/customers/models/enums/customer-type.enum';
import { SearchFieldComponent } from '@shared/components/ui';

@Component({
  template: `<app-customer-picker-dialog
    [visible]="visible"
    (customerSelected)="onCustomerSelected($event)"
    (cancelled)="onCancelled()"
  ></app-customer-picker-dialog>`,
  imports: [CustomerPickerDialogComponent],
})
class HostComponent {
  visible = false;
  onCustomerSelected = vi.fn();
  onCancelled = vi.fn();
}

describe('CustomerPickerDialogComponent', () => {
  let hostComponent: HostComponent;
  let fixture: ComponentFixture<HostComponent>;
  let dialog: CustomerPickerDialogComponent;
  let mockCustomerApi: Partial<CustomerApiService>;

  const mockCustomers: CustomerList[] = [
    {
      id: 'c1',
      code: 'C001',
      legalName: 'Customer One',
      rif: 'J-12345678-9',
      type: CustomerType.BUSINESS,
      active: true,
    },
    {
      id: 'c2',
      code: 'C002',
      legalName: 'Customer Two',
      rif: 'V-98765432-1',
      type: CustomerType.INDIVIDUAL,
      active: true,
    },
  ];

  const mockPageResponse = {
    content: mockCustomers,
    totalElements: 2,
    totalPages: 1,
    number: 0,
  };

  beforeEach(() => {
    mockCustomerApi = {
      getForPicker: vi.fn().mockReturnValue(of(mockPageResponse)),
    };

    TestBed.configureTestingModule({
      imports: [HostComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [{ provide: CustomerApiService, useValue: mockCustomerApi }],
    });

    fixture = TestBed.createComponent(HostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
    dialog = fixture.debugElement.children[0].componentInstance;
  });

  it('should create', () => {
    expect(dialog).toBeTruthy();
  });

  it('should have default visible input as false', () => {
    expect(dialog.visible()).toBe(false);
  });

  it('should have default search as empty string', () => {
    expect(dialog.search()).toBe('');
  });

  it('should have default customers as empty array', () => {
    expect(dialog.customers()).toEqual([]);
  });

  it('should have default loading as false', () => {
    expect(dialog.loading()).toBe(false);
  });

  it('should have default currentPage as 0', () => {
    expect(dialog.currentPage()).toBe(0);
  });

  it('should have default filterType as null', () => {
    expect(dialog.filterType()).toBeNull();
  });

  it('should have customerTypes array', () => {
    expect(dialog.customerTypes.length).toBeGreaterThan(0);
  });

  it('should have pageSize of 10', () => {
    expect(dialog.pageSize).toBe(10);
  });

  it('should have pageLabel computed', () => {
    dialog.totalPages.set(3);
    dialog.currentPage.set(0);
    expect(dialog.pageLabel()).toBe('Página 1 de 3');
  });

  it('should have empty pageLabel when no pages', () => {
    dialog.totalPages.set(0);
    expect(dialog.pageLabel()).toBe('');
  });

  it('should have activeFilterCount as 0 when no filter', () => {
    expect(dialog.activeFilterCount()).toBe(0);
  });

  it('should have activeFilterCount as 1 when filterType is set', () => {
    dialog.filterType.set(CustomerType.BUSINESS);
    expect(dialog.activeFilterCount()).toBe(1);
  });

  it('should emit cancelled on cancel', () => {
    dialog.onCancel();
    expect(hostComponent.onCancelled).toHaveBeenCalled();
  });

  it('should emit customerSelected on select', () => {
    dialog.onSelect(mockCustomers[0]);
    expect(hostComponent.onCustomerSelected).toHaveBeenCalledWith(mockCustomers[0]);
  });
});

describe('CustomerPickerDialogComponent - visible', () => {
  let hostComponent: HostComponent;
  let fixture: ComponentFixture<HostComponent>;
  let dialog: CustomerPickerDialogComponent;
  let mockCustomerApi: Partial<CustomerApiService>;

  const mockCustomers: CustomerList[] = [
    {
      id: 'c1',
      code: 'C001',
      legalName: 'Customer One',
      rif: 'J-12345678-9',
      type: CustomerType.BUSINESS,
      active: true,
    },
  ];

  const mockPageResponse = {
    content: mockCustomers,
    totalElements: 1,
    totalPages: 1,
    number: 0,
  };

  beforeEach(() => {
    mockCustomerApi = {
      getForPicker: vi.fn().mockReturnValue(of(mockPageResponse)),
    };

    TestBed.configureTestingModule({
      imports: [HostComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [{ provide: CustomerApiService, useValue: mockCustomerApi }],
    });

    fixture = TestBed.createComponent(HostComponent);
    hostComponent = fixture.componentInstance;
    hostComponent.visible = true;
    fixture.detectChanges();
    dialog = fixture.debugElement.children[0].componentInstance;
  });

  it('should load customers on dialog show', () => {
    expect(mockCustomerApi.getForPicker).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 0,
        size: 10,
      }),
    );
  });

  it('should set customers after loading', async () => {
    await fixture.whenStable();
    expect(dialog.customers()).toHaveLength(1);
    expect(dialog.customers()[0].legalName).toBe('Customer One');
  });

  it('should set totalElements after loading', async () => {
    await fixture.whenStable();
    expect(dialog.totalElements()).toBe(1);
  });

  it('should set totalPages after loading', async () => {
    await fixture.whenStable();
    expect(dialog.totalPages()).toBe(1);
  });

  it('should set loading to false after success', async () => {
    await fixture.whenStable();
    expect(dialog.loading()).toBe(false);
  });

  it('should render the desktop customer search outside the filter popover', () => {
    const desktopSearch = fixture.debugElement.query(
      By.css('[data-testid="desktop-customer-search"]'),
    );

    expect(desktopSearch).toBeTruthy();
    expect(desktopSearch.componentInstance).toBeInstanceOf(SearchFieldComponent);
    expect(desktopSearch.nativeElement.classList).toContain('hidden');
    expect(desktopSearch.nativeElement.classList).toContain('sm:block');
  });

  it('should render the mobile customer search inside the filter popover', async () => {
    const filterButton = fixture.debugElement.query(By.css('button[aria-label="Filtros"]'));

    filterButton.nativeElement.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const mobileSearch = document.body.querySelector(
      '[data-testid="mobile-customer-search"]',
    ) as HTMLElement | null;

    expect(mobileSearch).toBeTruthy();
    expect(mobileSearch?.classList).toContain('sm:hidden');
    expect(mobileSearch?.closest('.p-popover')).toBeTruthy();
  });

  it('should set loading to false on error', async () => {
    mockCustomerApi.getForPicker = vi.fn().mockReturnValue(throwError(() => new Error('Failed')));

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HostComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [{ provide: CustomerApiService, useValue: mockCustomerApi }],
    });

    fixture = TestBed.createComponent(HostComponent);
    hostComponent = fixture.componentInstance;
    hostComponent.visible = true;
    fixture.detectChanges();
    dialog = fixture.debugElement.children[0].componentInstance;
    await fixture.whenStable();

    expect(dialog.loading()).toBe(false);
  });

  it('should only load once on multiple dialog shows', () => {
    dialog.onDialogShow();
    expect(mockCustomerApi.getForPicker).toHaveBeenCalledTimes(1);
  });

  it('should reset search and page on dialog show', () => {
    dialog.search.set('test');
    dialog.currentPage.set(2);
    dialog.onDialogShow();
    expect(dialog.search()).toBe('');
    expect(dialog.currentPage()).toBe(0);
  });
});

describe('CustomerPickerDialogComponent - interactions', () => {
  let hostComponent: HostComponent;
  let fixture: ComponentFixture<HostComponent>;
  let dialog: CustomerPickerDialogComponent;
  let mockCustomerApi: Partial<CustomerApiService>;

  const mockPageResponse = {
    content: [],
    totalElements: 0,
    totalPages: 1,
    number: 0,
  };

  beforeEach(() => {
    mockCustomerApi = {
      getForPicker: vi.fn().mockReturnValue(of(mockPageResponse)),
    };

    TestBed.configureTestingModule({
      imports: [HostComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [{ provide: CustomerApiService, useValue: mockCustomerApi }],
    });

    fixture = TestBed.createComponent(HostComponent);
    hostComponent = fixture.componentInstance;
    hostComponent.visible = true;
    fixture.detectChanges();
    dialog = fixture.debugElement.children[0].componentInstance;
  });

  it('should load page 0 on search change', () => {
    dialog.onSearchChange('test');
    expect(dialog.search()).toBe('test');
    expect(mockCustomerApi.getForPicker).toHaveBeenCalledWith(
      expect.objectContaining({ search: 'test', page: 0 }),
    );
  });

  it('should load previous page', () => {
    dialog.currentPage.set(2);
    dialog.onPagePrev();
    expect(mockCustomerApi.getForPicker).toHaveBeenCalledWith(expect.objectContaining({ page: 1 }));
  });

  it('should not load previous page when on first page', () => {
    dialog.currentPage.set(0);
    dialog.onPagePrev();
    expect(mockCustomerApi.getForPicker).toHaveBeenCalledTimes(1);
  });

  it('should load next page', () => {
    dialog.totalPages.set(3);
    dialog.currentPage.set(0);
    dialog.onPageNext();
    expect(mockCustomerApi.getForPicker).toHaveBeenCalledWith(expect.objectContaining({ page: 1 }));
  });

  it('should not load next page when on last page', () => {
    dialog.totalPages.set(3);
    dialog.currentPage.set(2);
    dialog.onPageNext();
    expect(mockCustomerApi.getForPicker).toHaveBeenCalledTimes(1);
  });

  it('should load with type filter when selectType is called', () => {
    dialog.selectType(CustomerType.INDIVIDUAL);
    expect(dialog.filterType()).toBe(CustomerType.INDIVIDUAL);
    expect(mockCustomerApi.getForPicker).toHaveBeenCalledWith(
      expect.objectContaining({ type: CustomerType.INDIVIDUAL, page: 0 }),
    );
  });

  it('should clear filters and reload', () => {
    dialog.filterType.set(CustomerType.BUSINESS);
    dialog.clearFilters();
    expect(dialog.filterType()).toBeNull();
    expect(mockCustomerApi.getForPicker).toHaveBeenCalledWith(
      expect.objectContaining({ type: undefined, page: 0 }),
    );
  });
});
