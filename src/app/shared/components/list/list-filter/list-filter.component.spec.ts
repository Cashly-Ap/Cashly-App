import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ListFilterComponent, ListFilterField } from '@shared/components/list/list-filter/list-filter.component';

describe('ListFilterComponent', () => {
  let component: ListFilterComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ListFilterComponent] });
    component = TestBed.createComponent(ListFilterComponent).componentInstance;
  });

  it('has no active filters by default', () => {
    expect(component.activeCount()).toBe(0);
    expect(component.hasActiveFilters()).toBe(false);
  });

  it('emits the selected option for a config driven field', () => {
    const listener = vi.fn();
    component.filterChange.subscribe(listener);
    const field: ListFilterField = {
      key: 'status',
      labelKey: 'shared.status',
      type: 'select',
      value: '',
      options: [{ labelKey: 'shared.active', value: 'ACTIVE' }],
    };

    component.changeField(field, 'ACTIVE');

    expect(listener).toHaveBeenCalledWith({ key: 'status', value: 'ACTIVE' });
  });

  it('emits the text value for a config driven field', () => {
    const listener = vi.fn();
    component.filterChange.subscribe(listener);
    const field: ListFilterField = {
      key: 'search',
      labelKey: 'shared.search',
      type: 'text',
      value: '',
    };

    component.onTextChange(field, 'Ana');

    expect(listener).toHaveBeenCalledWith({ key: 'search', value: 'Ana' });
  });

  it('serializes date values as an ISO day', () => {
    const listener = vi.fn();
    component.filterChange.subscribe(listener);
    const field: ListFilterField = {
      key: 'dateFrom',
      labelKey: 'shared.startDate',
      type: 'date',
      value: '',
    };

    component.changeDate(field, new Date('2025-03-04T00:00:00.000Z'));

    expect(listener).toHaveBeenCalledWith({ key: 'dateFrom', value: '2025-03-04' });
  });

  it('emits cleared when the user asks to reset filters', () => {
    const listener = vi.fn();
    component.cleared.subscribe(listener);

    component.cleared.emit();

    expect(listener).toHaveBeenCalledOnce();
  });

  it('marks filters as active when the count is positive', () => {
    const fixture = TestBed.createComponent(ListFilterComponent);
    fixture.componentRef.setInput('activeCount', 3);
    fixture.detectChanges();

    expect(fixture.componentInstance.hasActiveFilters()).toBe(true);
  });
});
