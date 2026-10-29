import { connectListNavigation } from '@shared/components/list/list-navigation.service';
import { ListAction } from '@shared/components/list/list-action-buttons/list-action-buttons.component';
import { PermissionDirective } from '@features/platform/auth/authorization/directives/permission.directive';
import {
  Component,
  inject,
  OnInit,
  signal,
  computed,
  ChangeDetectionStrategy,
  DestroyRef,
} from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { ContentCardComponent } from '@shared/components/ui/content-card/content-card.component';
import { ListContainerComponent } from '@shared/components/list/list-container/list-container.component';
import { LoadingSpinnerComponent } from '@shared/components/ui/loading-spinner/loading-spinner.component';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { Popover } from 'primeng/popover';
import { CashRegisterApplicationService } from '@features/finance/treasury/cash-register/services/application/cash-register-application.service';

@Component({
  selector: 'app-cash-register-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PermissionDirective,
    CommonModule,
    ReactiveFormsModule,
    CurrencyPipe,
    DatePipe,
    RouterModule,
    ContentCardComponent,
    ListContainerComponent,
    LoadingSpinnerComponent,
    TableModule,
    ButtonModule,
    TagModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    TextareaModule,
    Popover,
  ],
  templateUrl: './cash-register-page.component.html',
})
export class CashRegisterPageComponent implements OnInit {
  private readonly service = inject(CashRegisterApplicationService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly activeClosure = this.service.activeClosure;
  readonly loading = this.service.loading;
  readonly currentUserName = this.service.currentUserName;

  readonly showInitialLoading = computed(
    () => this.service.loading() && this.service.activeClosure() === null,
  );

  readonly showEmptyState = computed(
    () => !this.service.loading() && this.service.activeClosure() === null,
  );

  readonly closure = computed(() => this.service.activeClosure());
  readonly details = computed(() => this.closure()?.details ?? []);
  readonly isOpen = computed(() => this.closure()?.status === 'OPEN');
  readonly isClosed = computed(() => this.closure()?.status === 'CLOSED');

  readonly canClose = computed(() => this.isOpen());

  readonly openDialogVisible = signal(false);
  readonly closeDialogVisible = signal(false);
  readonly detailDialogVisible = signal(false);

  readonly isSubmitting = signal(false);

  readonly openForm = this.fb.group({
    openedByName: ['', Validators.required],
    openingBalance: [0, [Validators.required, Validators.min(0)]],
  });

  readonly closeForm = this.fb.group({
    closedByName: ['', Validators.required],
    declaredBalance: [0, [Validators.required, Validators.min(0)]],
    closingNotes: [''],
  });

  private readonly listNavigation = connectListNavigation({
    records: () => [],
    loading: () => this.loading(),
    total: () => 0,
    first: () => 0,
    rows: () => 10,
    search: () => undefined,
    paginate: () => undefined,
    label: () => '',
    actions: () => [],
    globalActions: () => this.navigationActions(),
  });

  private navigationActions(): ListAction[] {
    return [
      {
        label: 'Abrir caja',
        icon: 'pi pi-lock-open',
        requiredAction: 'EXECUTE',
        disabled: this.closure() !== null,
        command: () => this.onOpenDialogOpen(),
      },
      {
        label: 'Cerrar caja',
        icon: 'pi pi-lock',
        requiredAction: 'EXECUTE',
        disabled: !this.isOpen(),
        command: () => this.onOpenCloseDialog(),
      },
      {
        label: 'Ver detalles',
        icon: 'pi pi-eye',
        requiredAction: 'READ',
        disabled: this.closure() === null,
        command: () => this.onOpenDetailDialog(),
      },
    ];
  }

  ngOnInit(): void {
    this.service.loadActiveClosure().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  onOpenDialogOpen(): void {
    this.openForm.reset({ openedByName: this.currentUserName(), openingBalance: 0 });
    this.openDialogVisible.set(true);
  }

  onOpenSubmit(): void {
    if (this.openForm.invalid) return;

    const openedByName = this.openForm.get('openedByName')?.value ?? '';
    const openingBalance = this.openForm.get('openingBalance')?.value ?? 0;
    this.isSubmitting.set(true);

    this.service
      .openRegister(openedByName, openingBalance)
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (result) => {
          if (!result) return;
          this.openDialogVisible.set(false);
          this.openForm.reset();
        },
      });
  }

  onOpenDialogClose(): void {
    this.openDialogVisible.set(false);
  }

  onOpenCloseDialog(): void {
    this.closeForm.reset({
      closedByName: this.currentUserName(),
      declaredBalance: this.closure()?.expectedBalance ?? 0,
      closingNotes: '',
    });
    this.closeDialogVisible.set(true);
  }

  onCloseSubmit(): void {
    if (this.closeForm.invalid) return;

    const id = this.closure()?.id;
    if (!id) return;

    this.isSubmitting.set(true);

    this.service
      .closeRegister(id, {
        closedByName: this.closeForm.get('closedByName')?.value ?? '',
        declaredBalance: this.closeForm.get('declaredBalance')?.value ?? 0,
        closingNotes: this.closeForm.get('closingNotes')?.value ?? '',
      })
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (result) => {
          if (!result) return;
          this.closeDialogVisible.set(false);
          this.closeForm.reset();
        },
      });
  }

  onCloseDialogClose(): void {
    this.closeDialogVisible.set(false);
  }

  onOpenDetailDialog(): void {
    this.detailDialogVisible.set(true);
  }

  onDetailDialogClose(): void {
    this.detailDialogVisible.set(false);
  }

  onViewHistory(): void {
    this.router.navigate(['/finance/treasury/cash-register/history']);
  }

  getStatusLabel(status: string | undefined): string {
    switch (status) {
      case 'OPEN':
        return 'Abierto';
      case 'CLOSED':
        return 'Cerrado';
      case 'VERIFIED':
        return 'Verificado';
      default:
        return status ?? '';
    }
  }

  getStatusSeverity(status: string | undefined): 'info' | 'warn' | 'success' | 'contrast' {
    switch (status) {
      case 'OPEN':
        return 'info';
      case 'CLOSED':
        return 'warn';
      case 'VERIFIED':
        return 'success';
      default:
        return 'contrast';
    }
  }
}
