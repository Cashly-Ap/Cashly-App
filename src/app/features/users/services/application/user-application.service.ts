import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap, finalize } from 'rxjs';
import { UserApiService, UserFilters } from '../api/user-api.service';
import { UserMapper } from '../mappers/user.mapper';
import { UserList, UserDetails, UserCreate, UserEdit } from '../../models/interfaces';
import { BusinessModule } from '../../models/enums';

@Injectable({ providedIn: 'root' })
export class UserApplicationService {
  private readonly api = inject(UserApiService);

  readonly users = signal<UserList[]>([]);
  readonly currentUser = signal<UserDetails | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  loadUsers(filters?: UserFilters): Observable<UserList[]> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.getAll(filters).pipe(
      tap({
        next: (users) => this.users.set(users),
        error: (err) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  loadUserById(id: string): Observable<UserDetails> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.getById(id).pipe(
      tap({
        next: (user) => this.currentUser.set(user),
        error: (err) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  createUser(data: UserCreate): Observable<UserDetails> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.create(data).pipe(
      tap({
        next: (user) => {
          const listItem = UserMapper.toList(user);
          this.users.update((current) => [...current, listItem]);
        },
        error: (err) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  updateUser(id: string, data: UserEdit): Observable<UserDetails> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.update(id, data).pipe(
      tap({
        next: (user) => {
          const listItem = UserMapper.toList(user);
          this.users.update((current) =>
            current.map((u) => (u.id === id ? listItem : u)),
          );
          if (this.currentUser()?.id === id) {
            this.currentUser.set(user);
          }
        },
        error: (err) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  deleteUser(id: string): Observable<void> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.delete(id).pipe(
      tap({
        next: () => {
          this.users.update((current) => current.filter((u) => u.id !== id));
        },
        error: (err) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  changePassword(id: string, password: string): Observable<void> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.changePassword(id, password).pipe(
      tap({ error: (err) => this.error.set(err.message) }),
      finalize(() => this.loading.set(false)),
    );
  }

  changeEmail(id: string, email: string): Observable<void> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.changeEmail(id, email).pipe(
      tap({
        next: () => {
          this.users.update((current) =>
            current.map((u) => (u.id === id ? { ...u, email } : u)),
          );
          if (this.currentUser()?.id === id) {
            this.currentUser.update((u) => (u ? { ...u, email } : null));
          }
        },
        error: (err) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  updateModulePermissions(id: string, modulePermissions: BusinessModule[]): Observable<UserDetails> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.updateModulePermissions(id, modulePermissions).pipe(
      tap({
        next: (user) => {
          if (this.currentUser()?.id === id) {
            this.currentUser.set(user);
          }
        },
        error: (err) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }
}
