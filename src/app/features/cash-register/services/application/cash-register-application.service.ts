import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, tap, catchError, finalize, of } from 'rxjs';
import { MessageService } from 'primeng/api';
import { AuthService } from '@features/auth/services/application/auth-application.service';
import { CashRegisterApiService } from '../api/cash-register-api.service';
import { PagedResponse } from '@shared/models/interfaces/paged-response.interface';
import {
  CashRegisterResponse,
  CloseRegisterRequest,
} from '../../models/interfaces/closure.interface';

@Injectable({ providedIn: 'root' })
export class CashRegisterApplicationService {
  private readonly api = inject(CashRegisterApiService);
  private readonly messageService = inject(MessageService);
  private readonly authService = inject(AuthService);

  readonly activeClosure = signal<CashRegisterResponse | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly history = signal<CashRegisterResponse[]>([]);
  readonly totalElements = signal(0);

  readonly isAdmin = computed(() => {
    const user = this.authService.currentUser();
    return user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  });

  readonly currentUserName = computed(() => {
    return this.authService.currentUser()?.userName ?? '';
  });

  loadActiveClosure(): Observable<CashRegisterResponse | null> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.getActive().pipe(
      tap({
        next: (closure) => this.activeClosure.set(closure),
        error: (err) => {
          if (err.status === 404) {
            this.activeClosure.set(null);
          } else {
            this.error.set('Error al cargar el cierre activo');
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al cargar el cierre activo',
              life: 5000,
            });
          }
        },
      }),
      catchError(() => of(null)),
      finalize(() => this.loading.set(false)),
    );
  }

  openRegister(openedByName: string): Observable<CashRegisterResponse | null> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.open({ openedByName }).pipe(
      tap({
        next: (closure) => {
          this.activeClosure.set(closure);
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Caja iniciada exitosamente',
            life: 3000,
          });
        },
        error: () => {
          this.error.set('Error al abrir la caja');
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al abrir la caja',
            life: 5000,
          });
        },
      }),
      catchError(() => of(null)),
      finalize(() => this.loading.set(false)),
    );
  }

  closeRegister(
    id: string,
    request: CloseRegisterRequest,
  ): Observable<CashRegisterResponse | null> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.close(id, request).pipe(
      tap({
        next: (closure) => {
          this.activeClosure.set(closure);
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Caja cerrada exitosamente',
            life: 3000,
          });
        },
        error: () => {
          this.error.set('Error al cerrar la caja');
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cerrar la caja',
            life: 5000,
          });
        },
      }),
      catchError(() => of(null)),
      finalize(() => this.loading.set(false)),
    );
  }

  verifyRegister(
    id: string,
    verifiedByName: string,
  ): Observable<CashRegisterResponse | null> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.verify(id, { verifiedByName }).pipe(
      tap({
        next: (closure) => {
          this.activeClosure.set(closure);
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Caja verificada exitosamente',
            life: 3000,
          });
        },
        error: () => {
          this.error.set('Error al verificar la caja');
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al verificar la caja',
            life: 5000,
          });
        },
      }),
      catchError(() => of(null)),
      finalize(() => this.loading.set(false)),
    );
  }

  loadHistory(
    page: number,
    size: number,
  ): Observable<PagedResponse<CashRegisterResponse> | null> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.getHistory(page, size).pipe(
      tap({
        next: (res) => {
          this.history.set(res.content ?? []);
          this.totalElements.set(res.totalElements ?? 0);
        },
        error: () => {
          this.error.set('Error al cargar el historial');
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar el historial de cierres',
            life: 5000,
          });
        },
      }),
      catchError(() => of(null)),
      finalize(() => this.loading.set(false)),
    );
  }

  clearActiveClosure(): void {
    this.activeClosure.set(null);
    this.error.set(null);
  }

  clearError(): void {
    this.error.set(null);
  }
}
