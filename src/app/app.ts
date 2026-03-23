import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { PdfViewerDialogComponent } from '@core/pdf-viewer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule, PdfViewerDialogComponent],
  template: `
    <p-toast position="top-right"></p-toast>
    <router-outlet></router-outlet>
    <app-pdf-viewer-dialog />
  `,
})
export class App {}
