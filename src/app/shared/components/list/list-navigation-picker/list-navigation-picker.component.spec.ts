import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';
import { ListNavigationPickerComponent } from './list-navigation-picker.component';
import {
  ListNavigationService,
  ListNavigationSession,
  NavigationRecord,
} from '../list-navigation.service';

describe('ListNavigationPickerComponent acceptance', () => {
  const record: NavigationRecord = {
    label: 'Order 1',
    description: 'Customer',
    action: () => undefined,
  };
  const records = signal([record]);
  const loading = signal(false);
  const search = vi.fn();
  const paginate = vi.fn();
  const select = vi.fn().mockResolvedValue(undefined);
  const session = signal<ListNavigationSession | null>(null);
  let component: ListNavigationPickerComponent;

  beforeEach(() => {
    TestBed.resetTestingModule();
    vi.clearAllMocks();
    records.set([record]);
    loading.set(false);
    session.set({
      owner: {},
      title: 'Editar',
      module: BusinessModule.SALES_QUOTES,
      route: new ActivatedRoute(),
      records,
      loading,
      total: () => 20,
      first: () => 0,
      rows: () => 10,
      search,
      paginate,
    });
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ListNavigationService,
          useValue: { session, available: () => !loading(), select, dismiss: vi.fn() },
        },
      ],
    });
    component = TestBed.runInInjectionContext(() => new ListNavigationPickerComponent());
  });

  it('selects a result without executing the action until Accept', async () => {
    component.selectRecord(record);
    expect(component.isSelected(record)).toBe(true);
    expect(select).not.toHaveBeenCalled();
    await component.acceptSelection();
    expect(select).toHaveBeenCalledOnce();
    expect(select).toHaveBeenCalledWith(record);
  });

  it('searches and changes page without executing and clears selection', () => {
    component.selectRecord(record);
    component.onSearch('Other');
    expect(component.selectedRecord()).toBeNull();
    expect(search).toHaveBeenCalledWith('Other');
    component.selectRecord(record);
    component.changePage(1);
    expect(component.selectedRecord()).toBeNull();
    expect(paginate).toHaveBeenCalledWith({ first: 10, rows: 10 });
    expect(select).not.toHaveBeenCalled();
  });

  it('clears selection when a filter changes', () => {
    const change = vi.fn();
    component.selectRecord(record);
    component.changeFilter(change, 'CONFIRMED');
    expect(component.selectedRecord()).toBeNull();
    expect(change).toHaveBeenCalledWith('CONFIRMED');
    expect(select).not.toHaveBeenCalled();
  });

  it('rejects a selection from an obsolete result set or session', async () => {
    component.selectRecord(record);
    records.set([]);
    await component.acceptSelection();
    expect(component.selectedRecord()).toBeNull();
    records.set([record]);
    component.selectRecord(record);
    session.set({ ...session()!, owner: {} });
    await component.acceptSelection();
    expect(select).not.toHaveBeenCalled();
  });

  it('does not select a record when its requested action is unavailable', () => {
    vi.spyOn(TestBed.inject(ListNavigationService), 'available').mockReturnValue(false);

    component.selectRecord(record);

    expect(component.selectedRecord()).toBeNull();
  });
});
