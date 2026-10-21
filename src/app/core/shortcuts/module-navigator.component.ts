import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  signal,
  viewChild,
  afterRenderEffect,
} from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from '@core/layouts/models';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';

interface ModuleDestination {
  label: string;
  group: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-module-navigator',
  standalone: true,
  imports: [DialogModule, InputTextModule],
  templateUrl: './module-navigator.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModuleNavigatorComponent {
  private readonly router = inject(Router);
  readonly items = input.required<MenuItem[]>();
  readonly visible = signal(false);
  readonly query = signal('');
  readonly selectedIndex = signal(-1);
  readonly results = viewChild<ElementRef<HTMLElement>>('results');
  readonly activeIndex = computed(() =>
    Math.min(this.selectedIndex(), this.destinations().length - 1),
  );

  constructor() {
    afterRenderEffect(() => {
      const index = this.activeIndex();
      this.results()
        ?.nativeElement.querySelector<HTMLElement>(`[data-result-index="${index}"]`)
        ?.scrollIntoView({ block: 'nearest' });
    });
  }
  readonly destinations = computed(() => {
    const flatten = (items: MenuItem[], group = ''): ModuleDestination[] =>
      items.flatMap((item) => [
        ...(item.routerLink
          ? [{ label: item.label, icon: item.icon, route: item.routerLink, group }]
          : []),
        ...flatten(item.children ?? [], group || item.label),
      ]);
    const query = this.query().trim().toLocaleLowerCase();
    return flatten(this.items()).filter((item) =>
      `${item.group} ${item.label}`.toLocaleLowerCase().includes(query),
    );
  });
  open(): void {
    this.query.set('');
    this.selectedIndex.set(-1);
    this.visible.set(true);
  }
  navigate(destination: ModuleDestination): void {
    if (!this.destinations().some((item) => item.route === destination.route)) return;
    this.visible.set(false);
    void this.router.navigateByUrl(destination.route);
  }
  onInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.selectedIndex.set(-1);
  }
  focusResults(): void {
    if (this.activeIndex() < 0 && this.destinations().length) this.selectedIndex.set(0);
    this.results()?.nativeElement.focus();
  }

  onKeydown(event: KeyboardEvent): void {
    if (
      event.defaultPrevented ||
      event.isComposing ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey
    )
      return;
    const editing = event.target instanceof HTMLInputElement;
    if (event.code === 'Escape' && editing) {
      event.preventDefault();
      event.stopPropagation();
      this.focusResults();
      return;
    }
    const down = event.code === 'ArrowDown' || (!editing && event.code === 'KeyJ');
    const up = event.code === 'ArrowUp' || (!editing && event.code === 'KeyK');
    if (down || up) {
      event.preventDefault();
      event.stopPropagation();
      const count = this.destinations().length;
      if (!count) return;
      const current = this.activeIndex();
      this.selectedIndex.set(
        current < 0 ? (down ? 0 : count - 1) : (current + (down ? 1 : -1) + count) % count,
      );
    } else if (event.code === 'Enter' && !event.repeat) {
      const destination = this.destinations()[this.activeIndex()];
      if (!destination) return;
      event.preventDefault();
      event.stopPropagation();
      this.navigate(destination);
    }
  }
}
