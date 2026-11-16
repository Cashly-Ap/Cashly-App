import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { TableModule } from 'primeng/table';
import { AvatarModule } from 'primeng/avatar';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { LocalizedDatePipe } from '@core/i18n/localized-format.pipe';
import { TranslationService } from '@core/i18n/translation.service';
import { TextBadgeComponent } from '@shared/components/ui/text-badge/text-badge.component';
import { AuditEvent } from '@features/platform/audit/models';

@Component({
  selector: 'app-audit-trail-list',
  standalone: true,
  imports: [
    TableModule,
    AvatarModule,
    TranslatePipe,
    LocalizedDatePipe,
    TextBadgeComponent,
  ],
  templateUrl: './audit-trail-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuditTrailListComponent {
  private readonly translations = inject(TranslationService);

  readonly events = input.required<AuditEvent[]>();

  initials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    return parts
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }

  description(event: AuditEvent): string {
    const translated = this.translations.t(event.descriptionKey);
    if (translated !== event.descriptionKey) return translated;

    const action = this.translations.t(`audit.actions.${event.action}`);
    const entity = this.translations.t(`audit.entities.${event.entityType}`);
    return `${action} · ${entity}`;
  }
}
