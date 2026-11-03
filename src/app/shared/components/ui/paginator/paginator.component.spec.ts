import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { PaginatorComponent } from './paginator.component';

describe('PaginatorComponent', () => {
  let component: PaginatorComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [PaginatorComponent] });
    component = TestBed.createComponent(PaginatorComponent).componentInstance;
  });

  it('uses the shared paginator defaults', () => {
    expect(component.first()).toBe(0);
    expect(component.rows()).toBe(10);
    expect(component.rowsPerPageOptions()).toEqual([10, 25, 50]);
    expect(component.showCurrentPageReport()).toBe(true);
    expect(component.dropdownAppendTo()).toBe('body');
  });

  it('emits the page change', () => {
    let emitted = false;
    component.pageChange.subscribe(() => (emitted = true));

    component.pageChange.emit({ first: 10, rows: 10 });

    expect(emitted).toBe(true);
  });
});
