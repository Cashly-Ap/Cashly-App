import { Component, input, output, signal, computed, effect } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FileUploadModule, FileSelectEvent, FileRemoveEvent } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-file-input',
  standalone: true,
  imports: [ReactiveFormsModule, FileUploadModule, ButtonModule],
  templateUrl: './file-input.component.html',
})
export class FileInputComponent {
  control = input.required<FormControl<File | null>>();
  label = input.required<string>();
  accept = input<string>('image/*');
  maxFileSize = input<number>(5000000);
  errorMessage = input<string>('');
  helpText = input<string>('');
  previewUrl = input<string | null>(null);

  fileSelected = output<File>();
  fileRemoved = output<void>();
  deleteExistingPhoto = output<void>();

  private selectedFileSignal = signal<File | null>(null);
  selectedFile = this.selectedFileSignal.asReadonly();

  private previewLoadErrorSignal = signal<boolean>(false);

  constructor() {
    effect(() => {
      this.previewUrl();
      this.previewLoadErrorSignal.set(false);
    });
  }

  previewImageUrl = computed<string | null>(() => {
    if (this.previewLoadErrorSignal()) {
      return null;
    }
    const file = this.selectedFileSignal();
    if (file) {
      return URL.createObjectURL(file);
    }
    return this.previewUrl();
  });

  onSelect(event: FileSelectEvent): void {
    const file = event.files[0];
    if (file) {
      this.selectedFileSignal.set(file);
      this.control().setValue(file);
      this.control().markAsTouched();
      this.fileSelected.emit(file);
    }
  }

  onRemove(_event: FileRemoveEvent): void {
    this.clearFile();
  }

  onClear(): void {
    this.clearFile();
  }

  private clearFile(): void {
    this.selectedFileSignal.set(null);
    this.previewLoadErrorSignal.set(false);
    this.control().setValue(null);
    this.control().markAsTouched();
    this.fileRemoved.emit();
  }

  onPreviewError(): void {
    this.previewLoadErrorSignal.set(true);
  }

  removeCurrentImage(): void {
    const hasExistingPhoto = !!this.previewUrl() && !this.selectedFileSignal();
    this.clearFile();
    if (hasExistingPhoto) {
      this.deleteExistingPhoto.emit();
    }
  }
}
