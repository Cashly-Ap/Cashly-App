import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthorizationService } from '@features/platform/auth/authorization/services/authorization.service';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';
import { connectListNavigation, ListNavigationService } from './list-navigation.service';
import { ListAction } from './list-action-buttons/list-action-buttons.component';

describe('List navigation actions', () => {
  const params = new BehaviorSubject(convertToParamMap({}));
  const navigate = vi.fn().mockResolvedValue(true);
  const can = vi.fn().mockReturnValue(true);
  const command = vi.fn();
  const records = signal([{ name: 'First record', deletable: true }]);
  const loading = signal(false);
  const search = vi.fn();
  const paginate = vi.fn();
  const onActionChange = vi.fn();
  let navigation: ListNavigationService;

  function connect() {
    TestBed.runInInjectionContext(() =>
      connectListNavigation({
        records,
        loading,
        total: () => 20,
        first: () => 0,
        rows: () => 10,
        search,
        paginate,
        onActionChange,
        label: (record) => record.name,
        actions: (record): ListAction[] =>
          record.deletable
            ? [
                {
                  label: 'Eliminar',
                  requiredAction: 'DELETE',
                  icon: 'pi pi-trash',
                  command,
                },
              ]
            : [],
      }),
    );
  }

  beforeEach(() => {
    TestBed.resetTestingModule();
    vi.clearAllMocks();
    can.mockReturnValue(true);
    navigate.mockResolvedValue(true);
    records.set([{ name: 'First record', deletable: true }]);
    loading.set(false);
    params.next(convertToParamMap({}));
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: { url: '/catalog/products', navigate } },
        { provide: ActivatedRoute, useValue: { queryParamMap: params } },
        { provide: AuthorizationService, useValue: { can } },
      ],
    });
    navigation = TestBed.inject(ListNavigationService);
  });

  it('waits for selection and reuses the original action after clearing the request', async () => {
    connect();
    params.next(convertToParamMap({ navAction: 'Eliminar' }));
    await Promise.resolve();
    expect(search).toHaveBeenCalledWith('');
    expect(command).not.toHaveBeenCalled();
    const session = navigation.session()!;
    session.search('First');
    session.paginate({ first: 10, rows: 10 });
    expect(search).toHaveBeenCalledWith('First');
    expect(paginate).toHaveBeenCalledWith({ first: 10, rows: 10 });
    await navigation.select(session.records()[0]);
    expect(navigate).toHaveBeenCalledWith(
      [],
      expect.objectContaining({
        queryParams: { navAction: null, navRecord: null, navSearch: null },
        queryParamsHandling: 'merge',
      }),
    );
    expect(command).toHaveBeenCalledOnce();
    expect(navigation.session()).toBeNull();
  });

  it('blocks unavailable states and stale records', async () => {
    connect();
    params.next(convertToParamMap({ navAction: 'Eliminar' }));
    await Promise.resolve();
    const stale = navigation.session()!.records()[0];
    records.set([{ name: 'Protected record', deletable: false }]);
    await navigation.select(stale);
    expect(navigation.session()!.records()).toEqual([]);
    expect(command).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('rechecks cross-module permissions and loading before executing', async () => {
    connect();
    params.next(convertToParamMap({ navAction: 'Eliminar' }));
    await Promise.resolve();
    const record = navigation.session()!.records()[0];
    loading.set(true);
    await navigation.select(record);
    loading.set(false);
    can.mockImplementation(() => false);
    await navigation.select(record);
    expect(command).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('dismisses without executing and can reopen the same action', async () => {
    connect();
    params.next(convertToParamMap({ navAction: 'Eliminar' }));
    await Promise.resolve();
    navigation.dismiss();
    params.next(convertToParamMap({}));
    params.next(convertToParamMap({ navAction: 'Eliminar' }));
    await Promise.resolve();
    expect(navigation.session()?.title).toBe('Eliminar');
    expect(command).not.toHaveBeenCalled();
  });

  it('sets the requested action before loading and clears it when the picker closes', async () => {
    connect();
    params.next(convertToParamMap({ navAction: 'Editar' }));
    expect(onActionChange).toHaveBeenLastCalledWith('Editar');
    expect(search).not.toHaveBeenCalled();
    await Promise.resolve();
    expect(search).toHaveBeenCalledWith('');
    params.next(convertToParamMap({}));
    expect(onActionChange).toHaveBeenLastCalledWith(null);
    expect(navigation.session()).toBeNull();
  });

  it('does not display records whose action is disabled', async () => {
    TestBed.runInInjectionContext(() =>
      connectListNavigation({
        records,
        loading,
        total: () => 1,
        first: () => 0,
        rows: () => 10,
        search,
        paginate,
        label: (record) => record.name,
        actions: () => [
          { label: 'Confirmar', requiredAction: 'EXECUTE', icon: '', disabled: true, command },
        ],
      }),
    );
    params.next(convertToParamMap({ navAction: 'Confirmar' }));
    await Promise.resolve();
    expect(navigation.session()!.records()).toEqual([]);
  });

  it('executes an accepted record on the destination without opening another picker', async () => {
    const selectedRecords = signal([{ id: 'selected-1', name: 'Accepted record' }]);
    TestBed.runInInjectionContext(() =>
      connectListNavigation({
        records: selectedRecords,
        loading,
        total: () => 1,
        first: () => 0,
        rows: () => 10,
        search,
        paginate,
        label: (record) => record.name,
        actions: () => [{ label: 'Editar', requiredAction: 'UPDATE', icon: '', command }],
      }),
    );
    params.next(
      convertToParamMap({
        navAction: 'Editar',
        navRecord: 'selected-1',
        navSearch: 'Accepted record',
      }),
    );
    await Promise.resolve();
    TestBed.flushEffects();
    await Promise.resolve();
    expect(search).toHaveBeenCalledWith('Accepted record');
    expect(navigation.session()).toBeNull();
    expect(command).toHaveBeenCalledOnce();
  });

  it('waits for asynchronous cash register state before opening its existing dialog', async () => {
    loading.set(true);
    TestBed.runInInjectionContext(() =>
      connectListNavigation({
        records: () => [],
        loading,
        total: () => 0,
        first: () => 0,
        rows: () => 10,
        search,
        paginate,
        label: () => '',
        actions: () => [],
        globalActions: () => [
          { label: 'Abrir caja', requiredAction: 'EXECUTE', icon: '', command },
        ],
      }),
    );
    params.next(convertToParamMap({ navAction: 'Abrir caja' }));
    await Promise.resolve();
    TestBed.flushEffects();
    expect(command).not.toHaveBeenCalled();
    loading.set(false);
    TestBed.flushEffects();
    await Promise.resolve();
    expect(command).toHaveBeenCalledOnce();
  });
});
