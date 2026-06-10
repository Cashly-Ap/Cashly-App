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
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { MainLayoutComponent } from '@core/layouts/main-layout.component';
import { ContentCardComponent } from '@shared/components/ui/content-card/content-card.component';
import { ListContainerComponent } from '@shared/components/list/list-container/list-container.component';
import { LoadingSpinnerComponent } from '@shared/components/ui/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '@shared/components/ui/empty-state/empty-state.component';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { CashRegisterApplicationService } from '../../services/application/cash-register-application.service';

@Component({
  selector: 'app-cash-register-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CurrencyPipe,
    DatePipe,
    MainLayoutComponent,
    ContentCardComponent,
    ListContainerComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    TableModule,
    ButtonModule,
    CardModule,
    TagModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
    TooltipModule,
  ],
  templateUrl: './cash-register-page.component.html',
})
export class CashRegisterPageComponent implements OnInit {
  private readonly service = inject(CashRegisterApplicationService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly activeClosure = this.service.activeClosure;
  readonly loading = this.service.loading;
  readonly isAdmin = this.service.isAdmin;
  readonly currentUserName = this.service.currentUserName;

  // ── Computed state ──────────────────────────────────────────────

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
  readonly isVerified = computed(() => this.closure()?.status === 'VERIFIED');

  readonly canClose = computed(() => this.isOpen());
  readonly canVerify = computed(() => this.isClosed() && this.isAdmin());

  // ── Dialog visibility ───────────────────────────────────────────

  readonly openDialogVisible = signal(false);
  readonly closeDialogVisible = signal(false);
  readonly verifyDialogVisible = signal(false);
  readonly detailDialogVisible = signal(false);

  readonly isSubmitting = signal(false);

  // ── Open closure form ───────────────────────────────────────────

  readonly openForm = this.fb.group({
    openedByName: ['', Validators.required],
  });

  // ── Close closure form ──────────────────────────────────────────

  readonly closeForm = this.fb.group({
    closedByName: ['', Validators.required],
    closingNotes: [''],
  });

  // ── Verify closure form ─────────────────────────────────────────

  readonly verifyForm = this.fb.group({
    verifiedByName: ['', Validators.required],
  });

  // ── Lifecycle ───────────────────────────────────────────────────

  ngOnInit(): void {
    this.service
      .loadActiveClosure()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  // ── Open closure ────────────────────────────────────────────────

  onOpenDialogOpen(): void {
    this.openForm.reset({ openedByName: this.currentUserName() });
    this.openDialogVisible.set(true);
  }

  onOpenSubmit(): void {
    if (this.openForm.invalid) return;

    const openedByName = this.openForm.get('openedByName')?.value ?? '';
    this.isSubmitting.set(true);

    this.service
      .openRegister(openedByName)
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.openDialogVisible.set(false);
          this.openForm.reset();
        },
      });
  }

  onOpenDialogClose(): void {
    this.openDialogVisible.set(false);
  }

  // ── Close closure ───────────────────────────────────────────────

  onOpenCloseDialog(): void {
    this.closeForm.reset({
      closedByName: this.currentUserName(),
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
        closingNotes: this.closeForm.get('closingNotes')?.value ?? '',
      })
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.closeDialogVisible.set(false);
          this.closeForm.reset();
        },
      });
  }

  onCloseDialogClose(): void {
    this.closeDialogVisible.set(false);
  }

  // ── Verify closure ──────────────────────────────────────────────

  onOpenVerifyDialog(): void {
    this.verifyForm.reset({ verifiedByName: this.currentUserName() });
    this.verifyDialogVisible.set(true);
  }

  onVerifySubmit(): void {
    if (this.verifyForm.invalid) return;

    const id = this.closure()?.id;
    if (!id) return;

    this.isSubmitting.set(true);

    this.service
      .verifyRegister(id, this.verifyForm.get('verifiedByName')?.value ?? '')
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.verifyDialogVisible.set(false);
          this.verifyForm.reset();
        },
      });
  }

  onVerifyDialogClose(): void {
    this.verifyDialogVisible.set(false);
  }

  // ── Detail Dialog ───────────────────────────────────────────────

  onOpenDetailDialog(): void {
    this.detailDialogVisible.set(true);
  }

  onDetailDialogClose(): void {
    this.detailDialogVisible.set(false);
  }

  // ── Template helpers ────────────────────────────────────────────

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

  getStatusSeverity(
    status: string | undefined,
  ): 'info' | 'warn' | 'success' | 'contrast' {
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
