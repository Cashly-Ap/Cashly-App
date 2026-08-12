import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'appCurrency',
  standalone: true,
})
export class CurrencyPipe implements PipeTransform {
  transform(value: number | null | undefined, decimals: number = 2): string {
    if (value === null || value === undefined) {
      return '0,00$';
    }

    const formattedNumber = value.toLocaleString('es-VE', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

    return `${formattedNumber}$`;
  }
}
