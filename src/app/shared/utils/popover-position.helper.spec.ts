import { Popover } from 'primeng/popover';
import { afterEach, describe, expect, it } from 'vitest';
import { alignPopoverToFixedTrigger } from './popover-position.helper';

const setScrollY = (value: number): void => {
  Object.defineProperty(window, 'scrollY', { value, writable: true, configurable: true });
};

const createPopover = (top: string): Popover => {
  const container = document.createElement('div');
  container.style.top = top;
  return { container } as unknown as Popover;
};

describe('alignPopoverToFixedTrigger', () => {
  afterEach(() => setScrollY(0));

  it('subtracts the scroll offset from the popover top', () => {
    setScrollY(306.5);
    const popover = createPopover('366.5px');

    alignPopoverToFixedTrigger(popover);

    expect(popover.container?.style.top).toBe('60px');
  });

  it('keeps the top when the page is not scrolled', () => {
    setScrollY(0);
    const popover = createPopover('70px');

    alignPopoverToFixedTrigger(popover);

    expect(popover.container?.style.top).toBe('70px');
  });

  it('ignores a missing container', () => {
    expect(() => alignPopoverToFixedTrigger(null)).not.toThrow();
  });

  it('ignores a non numeric top', () => {
    setScrollY(120);
    const popover = createPopover('');

    alignPopoverToFixedTrigger(popover);

    expect(popover.container?.style.top).toBe('');
  });
});
