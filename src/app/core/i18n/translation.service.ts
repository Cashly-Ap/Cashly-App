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
    const translated = (messages[resolved] ?? spanish[resolved] ?? this.catalogFallback(key))
      .replace(/\$\{([^}]+)\}/g, (placeholder, expression: string) => captures?.[expression] ?? placeholder);
    return translated.replace(/\{\{?\s*([\w.]+)\s*\}?\}/g, (placeholder, name: string) => {
      const value = parameters?.[name];
      return value == null ? placeholder : String(value);
    });
  }

  private catalogFallback(key: string): string {
    const rawValue = key
      .replace(/^platform\.auth\.(domains|permissions)\./, '')
      .replace(/^platform\.auth\./, '')
      .replace(/\.description$/, '')
      .replaceAll('.', ' ')
      .replaceAll('_', ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2');
    if (!rawValue || rawValue === key) return key;
    const moduleLabels: Record<string, string> = {
      'catalog products': 'Products',
      'catalog categories': 'Categories',
      'catalog prices': 'Price types',
      'catalog reports': 'Reports',
      'inventory warehouses': 'Warehouses',
      'inventory stock': 'Stock',
      'inventory movements': 'Movements',
      'inventory reports': 'Reports',
      'sales quotes': 'Quotes',
      'sales orders': 'Orders',
      'sales customers': 'Customers',
      'finance billing': 'Billing',
      'finance treasury': 'Treasury',
      'finance payment methods': 'Payment methods',
      'finance reports': 'Reports',
      'purchases orders': 'Purchase orders',
      'purchases suppliers': 'Suppliers',
      'finance invoices': 'Invoices',
      'finance returns': 'Returns',
      'finance credit notes': 'Credit notes',
      'finance debit notes': 'Debit notes',
      'finance cash register': 'Cash register',
      'finance cash register history': 'Cash register history',
      'finance receivables': 'Accounts receivable',
    };
    const actionLabels: Record<string, string> = {
      read: 'View',
      create: 'Create',
      update: 'Edit',
      delete: 'Delete',
      export: 'Export',
      execute: 'Execute',
      confirm: 'Confirm',
      cancel: 'Cancel',
    };
    const normalized = rawValue.toLowerCase();
    const permissionMatch = normalized.match(/^(.*) (read|create|update|delete|export|execute|confirm|cancel)$/);
    const value = permissionMatch
      ? `${moduleLabels[permissionMatch[1]] ?? permissionMatch[1]} ${actionLabels[permissionMatch[2]]}`
      : moduleLabels[normalized] ?? actionLabels[normalized] ?? rawValue;
    return value
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}
