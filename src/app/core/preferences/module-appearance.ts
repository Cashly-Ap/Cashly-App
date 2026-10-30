export const MODULE_APPEARANCE = {
  sales: { light: '#1d4ed8', dark: '#93c5fd' },
  procurement: { light: '#7e22ce', dark: '#d8b4fe' },
  catalog: { light: '#0f766e', dark: '#5eead4' },
  inventory: { light: '#a16207', dark: '#fcd34d' },
  finance: { light: '#15803d', dark: '#86efac' },
  partners: { light: '#be185d', dark: '#f9a8d4' },
  analytics: { light: '#4338ca', dark: '#a5b4fc' },
  platform: { light: '#475569', dark: '#cbd5e1' },
} as const;

export type ModuleGroup = keyof typeof MODULE_APPEARANCE;

export function moduleGroupFromUrl(url: string): ModuleGroup {
  const segment = url.split(/[?#]/, 1)[0].split('/').filter(Boolean)[0];
  return segment && Object.hasOwn(MODULE_APPEARANCE, segment)
    ? (segment as ModuleGroup)
    : 'platform';
}

export function moduleColor(group: ModuleGroup, dark: boolean): string {
  return MODULE_APPEARANCE[group][dark ? 'dark' : 'light'];
}

export function chartPalette(length: number, dark: boolean): string[] {
  const colors = Object.values(MODULE_APPEARANCE).map((entry) => entry[dark ? 'dark' : 'light']);
  return Array.from({ length }, (_, index) => colors[index % colors.length]);
}
