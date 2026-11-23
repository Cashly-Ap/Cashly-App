import { Popover } from 'primeng/popover';

export function alignPopoverToFixedTrigger(popover: Popover | null | undefined): void {
  const container = popover?.container;
  const view = container?.ownerDocument.defaultView;
  const scrollY = view?.scrollY ?? 0;

  if (!container || scrollY <= 0) return;

  const top = Number.parseFloat(container.style.top);
  if (!Number.isFinite(top)) return;

  container.style.top = `${top - scrollY}px`;
}
