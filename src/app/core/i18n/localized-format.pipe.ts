import { DatePipe, DecimalPipe } from '@angular/common';
import { Pipe, PipeTransform, inject } from '@angular/core';
import { LanguageService } from '@core/i18n/language.service';

@Pipe({ name: 'localizedDate', standalone: true, pure: false })
export class LocalizedDatePipe implements PipeTransform {
  private readonly language = inject(LanguageService);
  transform(
    value: string | number | Date | null | undefined,
    format = 'mediumDate',
    timezone?: string,
    _locale?: string,
  ): string | null {
    const preferredFormat =
      this.language.language() === 'en' ? format.replaceAll('dd/MM/yyyy', 'MM/dd/yyyy') : format;
    return new DatePipe(this.language.locale()).transform(value, preferredFormat, timezone);
  }
}

@Pipe({ name: 'localizedNumber', standalone: true, pure: false })
export class LocalizedNumberPipe implements PipeTransform {
  private readonly language = inject(LanguageService);
  transform(
    value: number | string | null | undefined,
    digitsInfo?: string,
    _locale?: string,
  ): string | null {
    return new DecimalPipe(this.language.locale()).transform(value, digitsInfo);
  }
}

@Pipe({ name: 'localizedCurrency', standalone: true, pure: false })
export class LocalizedCurrencyPipe implements PipeTransform {
  private readonly language = inject(LanguageService);
  transform(
    value: number | string | null | undefined,
    _currencyCode = 'USD',
    _display: string | boolean = 'symbol',
    digitsInfo?: string,
    _locale?: string,
  ): string | null {
    if (value === null || value === undefined || value === '') return null;
    const formatted = new DecimalPipe(this.language.locale()).transform(
      value,
      digitsInfo ?? '1.2-2',
    );
    return formatted === null ? null : `${formatted}$`;
  }
}
