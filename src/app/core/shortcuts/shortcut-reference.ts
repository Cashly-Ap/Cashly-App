export type ShortcutAction = 'new' | 'filter' | 'search' | 'submit' | 'cancel';

export const KEYBOARD_ACTION_SHORTCUTS = [
  { action: 'new', label: 'Nuevo registro', keys: 'N', code: 'KeyN' },
  { action: 'filter', label: 'Abrir filtros', keys: 'F', code: 'KeyF' },
  { action: 'search', label: 'Enfocar búsqueda', keys: 'B', code: 'KeyB' },
  { action: 'submit', label: 'Guardar o aceptar', keys: 'G', code: 'KeyG' },
  {
    action: 'cancel',
    label: 'Cancelar o volver',
    keys: 'Esc',
    code: 'Escape',
  },
  { action: 'navigate', label: 'Ir a un módulo', keys: 'M', code: 'KeyM' },
] as const;

export type ShortcutBinding = (typeof KEYBOARD_ACTION_SHORTCUTS)[number];
