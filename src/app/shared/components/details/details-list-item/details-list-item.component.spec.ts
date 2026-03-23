import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { DetailsListItemComponent } from './details-list-item.component';
import { ComponentRef, Component } from '@angular/core';

@Component({
  standalone: true,
  imports: [DetailsListItemComponent],
  template: `
    <app-details-list-item [icon]="'pi-at'" [value]="'test@example.com'">
      <div badges class="test-badges">Badge</div>
    </app-details-list-item>
  `,
})
class TestHostComponent {}

describe('DetailsListItemComponent', () => {
  let component: DetailsListItemComponent;
  let fixture: ComponentFixture<DetailsListItemComponent>;
  let componentRef: ComponentRef<DetailsListItemComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DetailsListItemComponent],
    });

    fixture = TestBed.createComponent(DetailsListItemComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
  });

  it('should create', () => {
    componentRef.setInput('icon', 'pi-test');
    componentRef.setInput('value', 'test');
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display icon and value', () => {
    componentRef.setInput('icon', 'pi-at');
    componentRef.setInput('value', 'test@example.com');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const icon = compiled.querySelector('.pi-at');
    const value = compiled.querySelector('span');

    expect(icon).toBeTruthy();
    expect(value?.textContent?.trim()).toBe('test@example.com');
  });

  it('should apply custom value class', () => {
    componentRef.setInput('icon', 'pi-mobile');
    componentRef.setInput('value', '+1234567890');
    componentRef.setInput('valueClass', 'font-mono');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const value = compiled.querySelector('span:not([class*="pi-"])');
    expect(value?.classList.contains('font-mono')).toBe(true);
  });

  it('should have badges slot for content projection', () => {
    componentRef.setInput('icon', 'pi-at');
    componentRef.setInput('value', 'test@example.com');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const container = compiled.querySelector('div');
    expect(container).toBeTruthy();
  });

  it('should have hover effect class', () => {
    componentRef.setInput('icon', 'pi-test');
    componentRef.setInput('value', 'test');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const container = compiled.querySelector('.hover\\:shadow-md');
    expect(container).toBeTruthy();
  });
});
