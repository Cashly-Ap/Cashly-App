import { Injectable, inject } from '@angular/core';
import { LanguageService } from './language.service';
import { english, spanish } from './dictionaries';

export type TranslationParameters = Readonly<Record<string, string | number | null | undefined>>;

const sourceKeys = new Map(Object.entries(spanish).map(([key, value]) => [value.trim(), key]));
const escapePattern = (value: string) => Array.from(value, (character) => '.*+?^${}()|[]'.includes(character) || character.charCodeAt(0) === 92 ? String.fromCharCode(92) + character : character).join('');
const templates = Object.entries(spanish)
  .filter(([, source]) => source.includes('${'))
  .map(([key, source]) => {
    const expressions = [...source.matchAll(/\$\{([^}]+)\}/g)].map((match) => match[1]);
    const pieces = source.split(/\$\{[^}]+\}/g).map(escapePattern);
    return { key, expressions, pattern: new RegExp('^' + pieces.join('(.*?)') + '$') };
  });

@Injectable({ providedIn: 'root' })
export class TranslationService {
  readonly language = inject(LanguageService);

  t(key: string | null | undefined, parameters?: TranslationParameters): string {
    if (key == null) return '';
    let resolved = Object.hasOwn(spanish, key) ? key : sourceKeys.get(key.trim()) ?? key;
    let captures: Readonly<Record<string, string>> | undefined;
    if (!Object.hasOwn(spanish, resolved)) {
      for (const template of templates) {
        const match = key.match(template.pattern);
        if (!match) continue;
        resolved = template.key;
        captures = Object.fromEntries(template.expressions.map((expression, index) => [expression, match[index + 1]]));
        break;
      }
    }
    const messages = this.language.language() === 'en' ? english : spanish;
    const translated = (messages[resolved] ?? spanish[resolved] ?? key)
      .replace(/\$\{([^}]+)\}/g, (placeholder, expression: string) => captures?.[expression] ?? placeholder);
    return translated.replace(/\{\{?\s*([\w.]+)\s*\}?\}/g, (placeholder, name: string) => {
      const value = parameters?.[name];
      return value == null ? placeholder : String(value);
    });
  }
}
