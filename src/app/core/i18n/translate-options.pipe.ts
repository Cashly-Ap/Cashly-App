import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslationService } from './translation.service';

@Pipe({ name: 'translateOptions', standalone: true, pure: false })
export class TranslateOptionsPipe implements PipeTransform {
  private readonly translations = inject(TranslationService);
  transform<T extends { label?: string }>(options: readonly T[] | null | undefined, placeholdersOnly = false): T[] {
    return (options ?? []).map((option) => ({
      ...option,
      ...(typeof option.label === 'string' && (!placeholdersOnly || !('value' in option) || option.value == null || option.value === '') ? { label: this.translations.t(option.label) } : {}),
    }));
  }
}
