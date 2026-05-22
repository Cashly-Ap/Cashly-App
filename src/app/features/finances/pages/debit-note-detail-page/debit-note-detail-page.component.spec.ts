import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DebitNoteDetailPageComponent } from './debit-note-detail-page.component';

describe('DebitNoteDetailPageComponent', () => {
  let component: DebitNoteDetailPageComponent;
  let fixture: ComponentFixture<DebitNoteDetailPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DebitNoteDetailPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DebitNoteDetailPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
