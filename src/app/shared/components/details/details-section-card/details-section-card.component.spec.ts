import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { DetailsSectionCardComponent } from './details-section-card.component';
import { ComponentRef, Component } from '@angular/core';

@Component({
  standalone: true,
  imports: [DetailsSectionCardComponent],
  template: `
    <app-details-section-card [title]="'Test Section'" [icon]="'pi-envelope'">
      <div class="test-content">Section Content</div>
    </app-details-section-card>
  `,
})
class TestHostComponent {}

describe('DetailsSectionCardComponent', () => {
  let component: DetailsSectionCardComponent;
  let fixture: ComponentFixture<DetailsSectionCardComponent>;
  let componentRef: ComponentRef<DetailsSectionCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DetailsSectionCardComponent],
    });

    fixture = TestBed.createComponent(DetailsSectionCardComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
  });

  it('should create', () => {
    componentRef.setInput('title', 'Test');
    componentRef.setInput('icon', 'pi-test');
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display title and icon', () => {
    componentRef.setInput('title', 'Test Title');
    componentRef.setInput('icon', 'pi-envelope');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const title = compiled.querySelector('h3');
    const icon = compiled.querySelector('.pi-envelope');

    expect(title?.textContent?.trim()).toBe('Test Title');
    expect(icon).toBeTruthy();
  });

  it('should have scrollable content area', () => {
    componentRef.setInput('title', 'Test');
    componentRef.setInput('icon', 'pi-test');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const contentArea = compiled.querySelector('.overflow-y-auto');
    expect(contentArea).toBeTruthy();
    expect(contentArea?.classList.contains('max-h-96')).toBe(true);
  });

  it('should have content area for content projection', () => {
    componentRef.setInput('title', 'Test Section');
    componentRef.setInput('icon', 'pi-envelope');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const contentArea = compiled.querySelector('.overflow-y-auto');
    expect(contentArea).toBeTruthy();
  });
});
