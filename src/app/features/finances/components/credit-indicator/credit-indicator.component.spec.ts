import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreditIndicatorComponent } from './credit-indicator.component';

describe('CreditIndicatorComponent', () => {
  let component: CreditIndicatorComponent;
  let fixture: ComponentFixture<CreditIndicatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreditIndicatorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreditIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show danger when has overdue', () => {
    component.hasOverdue.set(true);
    fixture.detectChanges();
    expect(component.status().severity).toBe('danger');
    expect(component.status().label).toBe('Bloqueado');
  });

  it('should show danger when no credit available', () => {
    component.availableCredit.set(0);
    fixture.detectChanges();
    expect(component.status().severity).toBe('danger');
    expect(component.status().label).toBe('Sin crédito');
  });

  it('should show warn when low credit', () => {
    component.availableCredit.set(500);
    fixture.detectChanges();
    expect(component.status().severity).toBe('warn');
    expect(component.status().label).toBe('Crédito bajo');
  });

  it('should show success when credit available', () => {
    component.availableCredit.set(5000);
    fixture.detectChanges();
    expect(component.status().severity).toBe('success');
    expect(component.status().label).toBe('Disponible');
  });
});
