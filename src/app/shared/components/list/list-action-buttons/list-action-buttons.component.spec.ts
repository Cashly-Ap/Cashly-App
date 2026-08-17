import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ListActionButtonsComponent } from '@shared/components/list/list-action-buttons/list-action-buttons.component';

describe('ListActionButtonsComponent', () => {
  let component: ListActionButtonsComponent;
  let fixture: ComponentFixture<ListActionButtonsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ListActionButtonsComponent],
    });

    fixture = TestBed.createComponent(ListActionButtonsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('actions', [
      { label: 'Descargar PDF', icon: 'pi pi-file-pdf', command: vi.fn() },
      { label: 'Eliminar', icon: 'pi pi-trash', command: vi.fn(), danger: true },
      { label: 'Ver detalle', icon: 'pi pi-eye', command: vi.fn() },
      { label: 'Editar', icon: 'pi pi-pencil', command: vi.fn() },
    ]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('prioritizes view, edit and delete before module-specific actions', () => {
    expect(component.orderedActions().map((action) => action.label)).toEqual([
      'Ver detalle',
      'Editar',
      'Eliminar',
      'Descargar PDF',
    ]);
  });

  it('should render a single actions trigger', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('p-button')).toHaveLength(1);
  });

  it('should center the actions trigger in its table cell', () => {
    expect(fixture.nativeElement.classList).toContain('justify-center');
    expect(fixture.nativeElement.classList).toContain('w-full');
  });
});
