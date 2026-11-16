import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import { ModuleIconComponent } from '@shared/components/ui/module-icon/module-icon.component';

describe('ModuleIconComponent', () => {
  let fixture: ComponentFixture<ModuleIconComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ModuleIconComponent],
      providers: [provideRouter([])],
    });

    fixture = TestBed.createComponent(ModuleIconComponent);
  });

  it('should render the provided icon inside a circular badge', () => {
    fixture.componentRef.setInput('icon', 'pi pi-box');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const badge = compiled.querySelector('span.rounded-full');
    expect(badge).not.toBeNull();
    expect(badge?.querySelector('i.pi.pi-box')).not.toBeNull();
  });

  it('should render nothing when there is no icon for the route', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('span.rounded-full')).toBeNull();
  });
});
