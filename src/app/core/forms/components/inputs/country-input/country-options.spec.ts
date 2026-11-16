import { describe, expect, it } from 'vitest';
import { COUNTRY_OPTIONS, countryOptionsFor } from '@core/forms/components/inputs/country-input/country-options';

describe('World country selection', () => {
  it('includes all 249 ISO countries/territories plus Kosovo with unique codes and flags', () => {
    expect(COUNTRY_OPTIONS).toHaveLength(250);
    expect(new Set(COUNTRY_OPTIONS.map((option) => option.code)).size).toBe(250);
    expect(COUNTRY_OPTIONS.find((option) => option.code === 'ES')).toMatchObject({
      value: 'España',
      label: 'España',
      flagUrl: '/flags/es.svg',
    });
    expect(COUNTRY_OPTIONS.find((option) => option.code === 'VE')?.flagUrl).toBe('/flags/ve.svg');
    expect(COUNTRY_OPTIONS.some((option) => option.code === 'XK')).toBe(true);
  });

  it('displays existing English names and ISO values without changing stored addresses', () => {
    expect(countryOptionsFor('Spain').find((option) => option.value === 'Spain')?.label).toBe(
      'España',
    );
    expect(countryOptionsFor('US').find((option) => option.value === 'US')?.flagUrl).toBe(
      '/flags/us.svg',
    );
    expect(
      countryOptionsFor('Existing custom country').some(
        (option) => option.value === 'Existing custom country',
      ),
    ).toBe(true);
  });
});
