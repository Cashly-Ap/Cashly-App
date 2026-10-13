import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { ListContainerComponent } from '@shared/components/list/list-container/list-container.component';
import { Component } from '@angular/core';

@Component({
  standalone: true,
  imports: [ListContainerComponent],
  template: '<app-list-container><p>Customer list</p></app-list-container>',
})
class TestHostComponent {}

describe('ListContainerComponent', () => {
  let component: ListContainerComponent;
  let fixture: ComponentFixture<ListContainerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ListContainerComponent],
    });

    fixture = TestBed.createComponent(ListContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should project content through the content card', () => {
    const hostFixture = TestBed.createComponent(TestHostComponent);
    hostFixture.detectChanges();

    const compiled = hostFixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-content-card p')?.textContent).toBe('Customer list');
  });
});
