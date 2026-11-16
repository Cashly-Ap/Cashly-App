import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, tap, catchError, finalize, of, switchMap } from 'rxjs';
import { MessageService } from 'primeng/api';
import { AuthService } from '@features/platform/auth/services/application/auth-application.service';
import { CashRegisterApiService } from '@features/finance/treasury/cash-register/services/api/cash-register-api.service';
import { PagedResponse } from '@shared/models/interfaces/paged-response.interface';
import {
  CashRegisterResponse,
  CloseRegisterRequest,
  CashRegisterHistoryView,
  CashRegisterReportFormat,
  CashMovementRequest,
} from '@features/finance/treasury/cash-register/models/interfaces/closure.interface';

@Injectable({ providedIn: 'root' })
export class CashRegisterApplicationService {
  private readonly api = inject(CashRegisterApiService);
  private readonly messageService = inject(MessageService);
  private readonly authService = inject(AuthService);

  readonly activeClosure = signal<CashRegisterResponse | null>(null);
  readonly selectedClosure = signal<CashRegisterResponse | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly history = signal<CashRegisterResponse[]>([]);
  readonly totalElements = signal(0);

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

  loadSession(id: string): Observable<CashRegisterResponse | null> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.getSession(id).pipe(
      tap({
        next: (closure) => {
          this.selectedClosure.set(closure);
          if (!closure) {
            this.error.set('No se encontró la sesión de caja');
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se encontró la sesión de caja',
              life: 5000,
            });
          }
        },
        error: () => {
          this.error.set('Error al cargar la sesión de caja');
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar la sesión de caja',
            life: 5000,
          });
        },
      }),
      catchError(() => of(null)),
      finalize(() => this.loading.set(false)),
    );
  }

  getSessionById(id: string): Observable<CashRegisterResponse | null> {
    return this.api.getSession(id);
  }

  clearSelectedClosure(): void {
    this.selectedClosure.set(null);
  }

  openRegister(
    openedByName: string,
    openingBalance: number,
  ): Observable<CashRegisterResponse | null> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.open({ openedByName, openingBalance }).pipe(
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
          this.activeClosure.set(null);
          if (closure && this.selectedClosure()?.id === closure.id) {
            this.selectedClosure.set(closure);
          }
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

  addMovement(id: string, request: CashMovementRequest): Observable<CashRegisterResponse | null> {
    this.loading.set(true);
    return this.api.addMovement(id, request).pipe(
      switchMap(() => this.api.getActive()),
      tap((register) => {
        this.activeClosure.set(register);
        this.messageService.add({
          severity: 'success',
          summary: 'Movimiento registrado',
          detail: 'El saldo esperado de la caja fue actualizado',
          life: 3000,
        });
      }),
      catchError(() => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo registrar el movimiento de caja',
          life: 5000,
        });
        return of(null);
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  loadHistory(
    page: number,
    size: number,
    dateFrom?: string,
    dateTo?: string,
    sort?: string,
    view: CashRegisterHistoryView = 'SIMPLE',
  ): Observable<PagedResponse<CashRegisterResponse> | null> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.getHistory(page, size, dateFrom, dateTo, sort, view).pipe(
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

  downloadSession(
    id: string,
    format: CashRegisterReportFormat,
    type: CashRegisterHistoryView,
  ): void {
    this.api.exportSession(id, format, type).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `caja-${id}-${type.toLowerCase()}.${format === 'PDF' ? 'pdf' : 'xlsx'}`;
        anchor.click();
        window.URL.revokeObjectURL(url);
      },
      error: () =>
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `No se pudo descargar el ${format}`,
          life: 5000,
        }),
    });
  }

  downloadExcel(dateFrom: string, dateTo: string): void {
    this.api.exportExcel(dateFrom, dateTo).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `cierre-caja-detallado-${dateFrom}_${dateTo}.xlsx`;
        anchor.click();
        window.URL.revokeObjectURL(url);
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Excel descargado exitosamente',
          life: 3000,
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al descargar el Excel',
          life: 5000,
        });
      },
    });
  }

  clearActiveClosure(): void {
    this.activeClosure.set(null);
    this.error.set(null);
  }

  clearError(): void {
    this.error.set(null);
  }
}
