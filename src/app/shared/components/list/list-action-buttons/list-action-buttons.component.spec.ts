import { Router } from '@angular/router';
import { AuthorizationService } from '@features/platform/auth/authorization/services/authorization.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ListActionButtonsComponent } from '@shared/components/list/list-action-buttons/list-action-buttons.component';

describe('ListActionButtonsComponent', () => {
  let component: ListActionButtonsComponent;
  let fixture: ComponentFixture<ListActionButtonsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ListActionButtonsComponent],
      providers: [
        { provide: Router, useValue: { url: '/catalog/products' } },
        { provide: AuthorizationService, useValue: { can: () => true } },
      ],
    });

    fixture = TestBed.createComponent(ListActionButtonsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('actions', [
      {
        requiredAction: 'EXPORT',
        label: 'Descargar PDF',
        icon: 'pi pi-file-pdf',
        command: vi.fn(),
      },
      {
        requiredAction: 'DELETE',
        label: 'Eliminar',
        icon: 'pi pi-trash',
        command: vi.fn(),
        danger: true,
      },
      { requiredAction: 'READ', label: 'Ver detalle', icon: 'pi pi-eye', command: vi.fn() },
      { requiredAction: 'UPDATE', label: 'Editar', icon: 'pi pi-pencil', command: vi.fn() },
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
