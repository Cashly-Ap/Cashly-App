import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslationParameters, TranslationService } from '@core/i18n/translation.service';

@Pipe({ name: 'translate', standalone: true, pure: false })
export class TranslatePipe implements PipeTransform {
  private readonly translations = inject(TranslationService);
  transform(value: string | null | undefined, parameters?: TranslationParameters): string {
    return this.translations.t(value, parameters);
  }
}
