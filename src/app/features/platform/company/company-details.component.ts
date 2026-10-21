import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DetailsCardComponent, DetailsCardHeaderComponent, DetailsInfoFieldComponent, DetailsInfoGridComponent } from '@shared/components/details';
import { PageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';
import { AuthService } from '../auth/services/application/auth-application.service';
import { BusinessModule } from '../auth/user/models/enums/business-module.enum';
import { Company, CompanyService } from './company.service';

@Component({
  selector: 'app-company-details',
  standalone: true,
  imports: [ButtonModule, PageHeaderComponent, DetailsCardComponent, DetailsCardHeaderComponent, DetailsInfoFieldComponent, DetailsInfoGridComponent],
  templateUrl: './company-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyDetailsComponent {
  readonly service = inject(CompanyService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly company = signal<Company | null>(null);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly canEdit = computed(() => this.auth.hasPermission(BusinessModule.COMPANY, 'UPDATE'));

  constructor() { this.load(); }

  load(): void {
    this.loading.set(true);
    this.error.set(false);
    this.service.load().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: company => { this.company.set(company); this.loading.set(false); },
      error: () => { this.error.set(true); this.loading.set(false); },
    });
  }

  display(value: string | null | undefined): string { return value?.trim() || 'No indicado'; }

  edit(): void {
    if (this.canEdit()) void this.router.navigate(['/platform/company/edit']);
  }
}
