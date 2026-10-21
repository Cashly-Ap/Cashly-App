import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FileInputComponent } from '@core/forms/components/inputs/file-input/file-input.component';
import { FileSelectEvent } from 'primeng/fileupload';

describe('FileInputComponent', () => {
  let component: FileInputComponent;
  let fixture: ComponentFixture<FileInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileInputComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(FileInputComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('control', new FormControl<File | null>(null));
    fixture.componentRef.setInput('label', 'Test File');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have correct default values', () => {
    expect(component.accept()).toBe('image/*');
    expect(component.maxFileSize()).toBe(5000000);
    expect(component.errorMessage()).toBe('');
    expect(component.helpText()).toBe('');
    expect(component.previewUrl()).toBeNull();
  });

  it('should update control value when file is selected', () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const mockEvent: FileSelectEvent = {
      files: [mockFile],
      originalEvent: new Event('select'),
      currentFiles: [mockFile],
    };

    component.onSelect(mockEvent);

    expect(component.control().value).toBe(mockFile);
    expect(component.selectedFile()).toBe(mockFile);
  });

  it('should emit fileSelected when file is selected', () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const mockEvent: FileSelectEvent = {
      files: [mockFile],
      originalEvent: new Event('select'),
      currentFiles: [mockFile],
    };

    let emittedFile: File | undefined;
    component.fileSelected.subscribe((file) => {
      emittedFile = file;
    });

    component.onSelect(mockEvent);

    expect(emittedFile).toBe(mockFile);
  });

  it('should clear file when onClear is called', () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const mockEvent: FileSelectEvent = {
      files: [mockFile],
      originalEvent: new Event('select'),
      currentFiles: [mockFile],
    };

    component.onSelect(mockEvent);
    expect(component.control().value).toBe(mockFile);

    component.onClear();

    expect(component.control().value).toBeNull();
    expect(component.selectedFile()).toBeNull();
  });

  it('should emit fileRemoved when file is cleared', () => {
    let emitted = false;
    component.fileRemoved.subscribe(() => {
      emitted = true;
    });

    component.onClear();

    expect(emitted).toBe(true);
  });

  it('should mark control as touched when file is selected', () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const mockEvent: FileSelectEvent = {
      files: [mockFile],
      originalEvent: new Event('select'),
      currentFiles: [mockFile],
    };

    expect(component.control().touched).toBe(false);

    component.onSelect(mockEvent);

    expect(component.control().touched).toBe(true);
  });

  it('should use previewUrl when no file is selected', () => {
    fixture.componentRef.setInput('previewUrl', 'https://example.com/image.jpg');
    fixture.detectChanges();

    expect(component.previewImageUrl()).toBe('https://example.com/image.jpg');
  });

  it('clears the selected preview when the parent resets a saved file', () => {
    const file = new File(['photo'], 'avatar.png', { type: 'image/png' });
    component.onSelect({ files: [file], currentFiles: [file], originalEvent: new Event('select') });
    component.control().reset();
    expect(component.selectedFile()).toBeNull();
    expect(component.previewImageUrl()).toBeNull();
  });

  it('should generate object URL for selected file', () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const mockEvent: FileSelectEvent = {
      files: [mockFile],
      originalEvent: new Event('select'),
      currentFiles: [mockFile],
    };

    component.onSelect(mockEvent);

    expect(component.previewImageUrl()).toContain('blob:');
  });
});
