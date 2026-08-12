import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CategoryApplicationService } from './category-application.service';
import { CategoryApiService } from '../api/category-api.service';
import { CategoryDetails } from '../../models/interfaces';

describe('CategoryApplicationService', () => {
  let service: CategoryApplicationService;
  let apiMock: Partial<CategoryApiService>;

  const mockDetails: CategoryDetails = {
    id: 1,
    name: 'Electrónica',
    description: 'Dispositivos electrónicos',
    active: true,
    productCount: 5,
    createdAt: '2025-01-15T10:30:00Z',
    updatedAt: '2025-01-15T10:30:00Z',
  };

  const mockPaged = {
    content: [
      { id: 1, name: 'Electrónica', description: 'Dispositivos', active: true, productCount: 5 },
    ],
    totalElements: 1,
    totalPages: 1,
    size: 10,
    number: 0,
    first: true,
    last: true,
    empty: false,
  };

  beforeEach(() => {
    apiMock = {
      getAll: vi.fn().mockReturnValue(of(mockPaged)),
      getById: vi.fn().mockReturnValue(of(mockDetails)),
      create: vi.fn().mockReturnValue(of(mockDetails)),
      update: vi.fn().mockReturnValue(of(mockDetails)),
      delete: vi.fn().mockReturnValue(of(undefined)),
    };

    TestBed.configureTestingModule({
      providers: [CategoryApplicationService, { provide: CategoryApiService, useValue: apiMock }],
    });

    service = TestBed.inject(CategoryApplicationService);
  });

  it('should_load_all_categories_and_update_signals', () => {
    service.loadAll().subscribe();
    expect(service.categories()).toHaveLength(1);
    expect(service.totalElements()).toBe(1);
    expect(service.loading()).toBe(false);
  });

  it('should_load_category_by_id_and_update_current', () => {
    service.loadById(1).subscribe();
    expect(service.currentCategory()?.name).toBe('Electrónica');
  });

  it('should_create_category_and_add_to_list', () => {
    service.create({ name: 'Nueva' }).subscribe();
    expect(service.categories()).toHaveLength(1);
  });

  it('should_delete_category_and_remove_from_list', () => {
    service.loadAll().subscribe();
    service.delete(1).subscribe();
    expect(service.categories()).toHaveLength(0);
  });
});
