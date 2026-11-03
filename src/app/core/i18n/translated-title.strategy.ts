import { Injectable, effect, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { LanguageService } from '@core/i18n/language.service';
import { TranslationService } from '@core/i18n/translation.service';

@Injectable({ providedIn: 'root' })
export class TranslatedTitleStrategy extends TitleStrategy {
  private readonly pageTitle = inject(Title);
  private readonly translations = inject(TranslationService);
  private readonly language = inject(LanguageService);
  private readonly rawTitle = signal<string | null>(null);

  constructor() {
    super();
    effect(() => {
      this.language.language();
      const title = this.rawTitle();
      this.pageTitle.setTitle(title ? this.translations.t(title) : 'Cashly');
    });
  }

  override updateTitle(snapshot: RouterStateSnapshot): void {
    this.rawTitle.set(this.buildTitle(snapshot) ?? null);
  }
}
