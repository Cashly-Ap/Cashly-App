import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { ButtonModule } from 'primeng/button';
import { DetailsCardHeaderComponent } from '@shared/components/details/details-card-header/details-card-header.component';
import { PageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';
import { PanelCardComponent } from '@shared/components/ui/panel-card/panel-card.component';
import { EmailVerificationApiService } from '@features/platform/auth/services/api/email-verification-api.service';

type VerificationState = 'loading' | 'success' | 'invalid' | 'expired' | 'used';

const EXPIRED_CODE = 'EMAIL_VERIFICATION_EXPIRED';
const USED_CODE = 'EMAIL_VERIFICATION_USED';

@Component({
  selector: 'app-verify-email-page',
  standalone: true,
  imports: [
    PanelCardComponent,
    TranslatePipe,
    ButtonModule,
    PageHeaderComponent,
    DetailsCardHeaderComponent,
  ],
  templateUrl: './verify-email-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerifyEmailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(EmailVerificationApiService);
  private readonly document = inject(DOCUMENT);

  readonly status = signal<VerificationState>('loading');

  constructor() {
    const token = this.route.snapshot.queryParamMap.get('token');
    this.stripTokenFromUrl();
    if (!token) {
      this.status.set('invalid');
      return;
    }
    this.api.confirm(token).subscribe({
      next: () => this.status.set('success'),
      error: (error: unknown) => this.status.set(this.failureState(error)),
    });
  }

  goToLogin(): void {
    void this.router.navigate(['/platform/auth/login']);
  }

  goToSecurity(): void {
    void this.router.navigate(['/platform/auth/security']);
  }

  private stripTokenFromUrl(): void {
    const view = this.document.defaultView;
    if (!view) return;
    const url = new URL(view.location.href);
    if (!url.searchParams.has('token')) return;
    url.searchParams.delete('token');
    view.history.replaceState(view.history.state, '', url.toString());
  }

  private failureState(error: unknown): VerificationState {
    const code = (error as { error?: { code?: string } } | null)?.error?.code;
    if (code === EXPIRED_CODE) return 'expired';
    if (code === USED_CODE) return 'used';
    return 'invalid';
  }
}
