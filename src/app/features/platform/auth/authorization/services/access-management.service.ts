import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Department, Role, SelectionOption, PermissionRegistry } from '../models/access.model';
@Injectable({ providedIn: 'root' })
export class AccessManagementService {
  private readonly http = inject(HttpClient);
  roles(action?: 'EDIT') {
    return this.http.get<Role[]>('/api/roles', action ? { params: { action } } : {});
  }
  departments() {
    return this.http.get<Department[]>('/api/departments');
  }
  roleOptions() {
    return this.http.get<SelectionOption[]>('/api/roles/options');
  }
  departmentOptions() {
    return this.http.get<SelectionOption[]>('/api/departments/options');
  }
  registry() {
    return this.http.get<PermissionRegistry[]>('/api/roles/registry');
  }
  saveRole(value: Partial<Role>) {
    return value.id
      ? this.http.put<Role>(`/api/roles/${value.id}`, value)
      : this.http.post<Role>('/api/roles', value);
  }
  saveDepartment(value: Partial<Department>) {
    return value.id
      ? this.http.put<Department>(`/api/departments/${value.id}`, value)
      : this.http.post<Department>('/api/departments', value);
  }
  delete(kind: 'roles' | 'departments', id: string) {
    return this.http.delete<void>(`/api/${kind}/${id}`);
  }
}
