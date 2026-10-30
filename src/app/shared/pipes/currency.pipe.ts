import { Pipe, PipeTransform, inject } from '@angular/core';
import { LanguageService } from '@core/i18n/language.service';

@Pipe({ name: 'appCurrency', standalone: true, pure: false })
export class CurrencyPipe implements PipeTransform {
  private readonly language = inject(LanguageService, { optional: true });
  transform(value: number | null | undefined, decimals = 2): string {
    const number = value ?? 0;
    const locale = this.language?.locale() ?? 'es-ES';
    const language = this.language?.language() ?? 'es';
    const formatted = number.toLocaleString(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    return language === 'en' ? `$${formatted}` : `${formatted}$`;
  }
}
