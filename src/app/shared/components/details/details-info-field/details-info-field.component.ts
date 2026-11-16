import { TranslatePipe } from '@core/i18n/translate.pipe';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusBadgeComponent } from '@shared/components/ui/status-badge/status-badge.component';
import {
  TextBadgeComponent,
  TextBadgeVariant,
} from '@shared/components/ui/text-badge/text-badge.component';

type FieldType = 'text' | 'code' | 'currency' | 'badge' | 'status' | 'tag' | 'text-badge';
type TagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';

@Component({
  selector: 'app-details-info-field',
  standalone: true,
  imports: [TranslatePipe, CommonModule, StatusBadgeComponent, TextBadgeComponent],
  templateUrl: './details-info-field.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailsInfoFieldComponent {
  label = input.required<string>();
  value = input<string | number>();
  type = input<FieldType>('text');
  colspan = input<'normal' | 'full'>('normal');
  active = input<boolean | undefined>(undefined);
  activeLabel = input<string>('Activo');
  inactiveLabel = input<string>('Inactivo');
  tagLabel = input<string>('');
  tagSeverity = input<TagSeverity>('info');
  textBadgeLabel = input<string>('');
  textBadgeVariant = input<TextBadgeVariant>('default');
}
