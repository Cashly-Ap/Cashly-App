import { describe, it, expect } from 'vitest';
import { WAREHOUSE_ROUTES } from './warehouse.routes';
import { BusinessModule } from '@features/users/models/enums';

describe('WAREHOUSE_ROUTES', () => {
  it('should define routes array', () => {
    expect(Array.isArray(WAREHOUSE_ROUTES)).toBe(true);
  });

  it('should have a parent route with guards', () => {
    const parent = WAREHOUSE_ROUTES[0];
    expect(parent.path).toBe('');
    expect(parent.canActivate).toBeDefined();
    expect(parent.canActivate).toHaveLength(2);
  });

  it('should have INVENTORY module data', () => {
    const parent = WAREHOUSE_ROUTES[0];
    expect(parent.data?.module).toBe(BusinessModule.INVENTORY);
  });

  it('should have 4 child routes', () => {
    const children = WAREHOUSE_ROUTES[0].children;
    expect(children).toHaveLength(4);
  });

  it('should have list route at empty path', () => {
    const listRoute = WAREHOUSE_ROUTES[0].children?.[0];
    expect(listRoute?.path).toBe('');
    expect(listRoute?.title).toBe('Almacenes');
    expect(listRoute?.loadComponent).toBeDefined();
  });

  it('should have new route', () => {
    const newRoute = WAREHOUSE_ROUTES[0].children?.[1];
    expect(newRoute?.path).toBe('new');
    expect(newRoute?.title).toBe('Nuevo Almacén');
    expect(newRoute?.loadComponent).toBeDefined();
  });

  it('should have details route with :id param', () => {
    const detailsRoute = WAREHOUSE_ROUTES[0].children?.[2];
    expect(detailsRoute?.path).toBe(':id');
    expect(detailsRoute?.title).toBe('Detalles de Almacén');
    expect(detailsRoute?.loadComponent).toBeDefined();
  });

  it('should have edit route with :id/edit param', () => {
    const editRoute = WAREHOUSE_ROUTES[0].children?.[3];
    expect(editRoute?.path).toBe(':id/edit');
    expect(editRoute?.title).toBe('Editar Almacén');
    expect(editRoute?.loadComponent).toBeDefined();
  });

  it('should lazy load list component', async () => {
    const listRoute = WAREHOUSE_ROUTES[0].children?.[0];
    const mod = await listRoute?.loadComponent!();
    expect(typeof mod).toBe('function');
    expect(mod.name).toContain('WarehousesListPageComponent');
  });

  it('should lazy load form component for new', async () => {
    const newRoute = WAREHOUSE_ROUTES[0].children?.[1];
    const mod = await newRoute?.loadComponent!();
    expect(typeof mod).toBe('function');
    expect(mod.name).toContain('WarehousesFormPageComponent');
  });

  it('should lazy load details component', async () => {
    const detailsRoute = WAREHOUSE_ROUTES[0].children?.[2];
    const mod = await detailsRoute?.loadComponent!();
    expect(typeof mod).toBe('function');
    expect(mod.name).toContain('WarehousesDetailsPageComponent');
  });

  it('should lazy load form component for edit', async () => {
    const editRoute = WAREHOUSE_ROUTES[0].children?.[3];
    const mod = await editRoute?.loadComponent!();
    expect(typeof mod).toBe('function');
    expect(mod.name).toContain('WarehousesFormPageComponent');
  });
});
