import { PrimeNG } from 'primeng/config';
import spanishComponents from '@shared/i18n/primeng/es.json';
import englishComponents from '@shared/i18n/primeng/en.json';
import { DOCUMENT, registerLocaleData } from '@angular/common';
import spanish from '@angular/common/locales/es';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Language } from '@core/i18n/language';

registerLocaleData(spanish, 'es');

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly document = inject(DOCUMENT);
  private readonly primeNG = inject(PrimeNG, { optional: true });
  private readonly current = signal<Language>('es');
  readonly language = this.current.asReadonly();
  readonly locale = computed(() => this.language() === 'en' ? 'en-US' : 'es');

  constructor() {
    effect(() => {
      this.document.documentElement.lang = this.language();
      this.primeNG?.setTranslation(this.language() === 'es' ? spanishComponents : englishComponents);
    });
  }

  setLanguage(language: Language): void {
    this.current.set(language);
  }
}
