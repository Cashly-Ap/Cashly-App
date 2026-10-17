import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { DetailActionsMenuComponent } from '@shared/components/details/detail-actions-menu/detail-actions-menu.component';

describe('DetailActionsMenuComponent', () => {
  let fixture: ComponentFixture<DetailActionsMenuComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [DetailActionsMenuComponent] });
    fixture = TestBed.createComponent(DetailActionsMenuComponent);
    fixture.detectChanges();
  });

  it('renders a single labeled actions trigger', () => {
    const trigger = fixture.nativeElement.querySelector('p-button') as HTMLElement;

    expect(trigger.getAttribute('label')).toBe('Acciones');
  });
});
