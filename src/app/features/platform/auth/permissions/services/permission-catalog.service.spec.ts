import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { PermissionCatalogService } from './permission-catalog.service';
import { PermissionCatalogModule } from '../models/permission-catalog.model';
import { Role } from '../../authorization/models/access.model';
import { BusinessModule } from '../../user/models/enums/business-module.enum';

const catalog: PermissionCatalogModule[] = [
  {
    module: BusinessModule.SALES_QUOTES,
    sortOrder: 40,
    groups: [
      {
        key: 'documents',
        labelKey: 'platform.auth.groups.sales.documents',
        sortOrder: 10,
        permissions: [
          {
            action: 'READ',
            labelKey: 'platform.auth.permissions.sales.documents.read',
            descriptionKey: 'platform.auth.permissions.sales.documents.read.description',
            sortOrder: 10,
          },
        ],
      },
    ],
  },
];

const roles: Role[] = [
  {
    id: 'operator',
    name: 'Operador',
    description: '',
    active: true,
    version: 0,
    systemKey: null,
    permissions: { [BusinessModule.SALES_QUOTES]: ['READ'] },
  },
];

describe('PermissionCatalogService', () => {
  let service: PermissionCatalogService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PermissionCatalogService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('requests the catalog and the roles and exposes them through signals', () => {
    expect(service.loading()).toBe(false);

    let result: PermissionCatalogModule[] = [];
    service.load().subscribe((value) => (result = value));
    expect(service.loading()).toBe(true);

    http.expectOne('/api/permissions/catalog').flush(catalog);
    http.expectOne('/api/roles').flush(roles);

    expect(result).toEqual(catalog);
    expect(service.catalog()).toEqual(catalog);
    expect(service.roles()).toEqual(roles);
    expect(service.loading()).toBe(false);
    expect(service.error()).toBe(false);
  });

  it('flags the error state when the catalog cannot be loaded', () => {
    let failed = false;
    service.load().subscribe({ next: () => undefined, error: () => (failed = true) });

    http.expectOne('/api/roles').flush(roles);
    http
      .expectOne('/api/permissions/catalog')
      .flush({ message: 'failed' }, { status: 500, statusText: 'Server Error' });

    expect(failed).toBe(true);
    expect(service.error()).toBe(true);
    expect(service.loading()).toBe(false);
    expect(service.catalog()).toEqual([]);
  });
});
