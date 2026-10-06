# ImageViewerDialogComponent

Componente moderno y elegante para visualizar imágenes en un modal dialog con controles de zoom y funcionalidades avanzadas. Diseñado específicamente para justificantes de pago y documentos visuales.

## ✨ Características

- 🖼️ **Visualización optimizada** - Imagen centrada con fondo contrastante
- 🔍 **Zoom interactivo** - Controles de zoom (50% - 300%) con botones
- 📥 **Descarga opcional** - Permite descargar la imagen con nombre personalizado
- 🎨 **Estados visuales** - Loading, error y estado vacío con iconos claros
- 📱 **Responsive** - Se adapta a móviles, tablets y escritorio
- 🌓 **Modo oscuro** - Soporte completo para tema claro/oscuro
- ⚡ **Lazy loading** - Carga diferida con indicador de progreso
- 🎯 **Maximizable** - Opción para pantalla completa

## 🎨 Capturas

```
┌─────────────────────────────────────────────────────┐
│  Justificante de Pago  [−] 100% [+] [↻]       × │
├─────────────────────────────────────────────────────┤
│                                                     │
│              ┌─────────────────┐                   │
│              │                 │                   │
│              │   📷 IMAGEN     │                   │
│              │                 │                   │
│              └─────────────────┘                   │
│                                                     │
├─────────────────────────────────────────────────────┤
│  [📥 Descargar Imagen]              [Cerrar]      │
└─────────────────────────────────────────────────────┘
```

## 📋 Uso Básico

```typescript
import { Component, signal } from '@angular/core';
import { ImageViewerDialogComponent } from '@shared/components/ui';

@Component({
  selector: 'app-payment-details',
  standalone: true,
  imports: [ImageViewerDialogComponent],
  template: `
    <p-button label="Ver Justificante" icon="pi pi-image" (onClick)="showImage()" />

    <app-image-viewer-dialog
      [visible]="imageVisible()"
      [imageUrl]="imageUrl()"
      [title]="'Justificante de Pago #12345'"
      [downloadable]="true"
      [downloadFilename]="'justificante-12345.jpg'"
      (visibleChange)="onImageDialogClose($event)"
    />
  `,
})
export class PaymentDetailsComponent {
  imageVisible = signal<boolean>(false);
  imageUrl = signal<string>('/api/files/payment-receipt-123.jpg');

  showImage(): void {
    this.imageVisible.set(true);
  }

  onImageDialogClose(visible: boolean): void {
    this.imageVisible.set(visible);
  }
}
```

## 🔧 API

### Propiedades (Inputs)

| Propiedad          | Tipo                  | Requerido | Default               | Descripción                           |
| ------------------ | --------------------- | --------- | --------------------- | ------------------------------------- |
| `visible`          | `boolean`             | ✅ Sí     | -                     | Controla la visibilidad del modal     |
| `imageUrl`         | `string \| null`      | ✅ Sí     | -                     | URL de la imagen a mostrar            |
| `title`            | `string`              | ❌ No     | `'Visualizar Imagen'` | Título del modal                      |
| `downloadable`     | `boolean`             | ❌ No     | `true`                | Habilita el botón de descarga         |
| `downloadFilename` | `string \| undefined` | ❌ No     | `undefined`           | Nombre personalizado para la descarga |

### Eventos (Outputs)

| Evento          | Tipo      | Descripción                        |
| --------------- | --------- | ---------------------------------- |
| `visibleChange` | `boolean` | Se emite cuando el modal se cierra |

### Métodos Públicos

| Método         | Descripción                                 |
| -------------- | ------------------------------------------- |
| `zoomIn()`     | Aumenta el zoom en 25% (máx 300%)           |
| `zoomOut()`    | Disminuye el zoom en 25% (mín 50%)          |
| `resetZoom()`  | Restablece el zoom a 100%                   |
| `onDownload()` | Descarga la imagen con nombre personalizado |

## 🎯 Casos de Uso

### 1. Justificantes de Pago (Payables)

```typescript
<app-image-viewer-dialog
  [(visible)]="showReceipt"
  [imageUrl]="payment.receiptUrl"
  [title]="'Justificante de Pago - ' + payment.invoiceNumber"
  [downloadable]="true"
  [downloadFilename]="'justificante-' + payment.id + '.jpg'"
/>
```

### 2. Facturas Escaneadas

```typescript
<app-image-viewer-dialog
  [(visible)]="showInvoice"
  [imageUrl]="invoice.scannedImageUrl"
  [title]="'Factura #' + invoice.number"
  [downloadable]="true"
  [downloadFilename]="'factura-' + invoice.number + '.jpg'"
/>
```

### 3. Documentos de Identidad (sin descarga)

```typescript
<app-image-viewer-dialog
  [(visible)]="showIdCard"
  [imageUrl]="customer.idCardImageUrl"
  [title]="'Cédula - ' + customer.name"
  [downloadable]="false"
/>
```

### 4. Integración con FileInput

```typescript
import { Component, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FileInputComponent } from '@core/forms/components/inputs/file-input';
import { ImageViewerDialogComponent } from '@shared/components/ui';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [FileInputComponent, ImageViewerDialogComponent],
  template: `
    <!-- Subir imagen -->
    <app-file-input
      [control]="receiptControl"
      label="Justificante de Pago"
      accept="image/*"
      [preview]="true"
      (fileSelected)="onFileSelected($event)"
    />

    <!-- Ver imagen completa -->
    @if (uploadedImageUrl()) {
      <p-button
        label="Ver Imagen Completa"
        icon="pi pi-search-plus"
        [outlined]="true"
        size="small"
        (onClick)="viewImage()"
      />
    }

    <!-- Modal visor -->
    <app-image-viewer-dialog
      [(visible)]="imageDialogVisible"
      [imageUrl]="uploadedImageUrl()"
      title="Justificante de Pago"
      [downloadable]="false"
    />
  `,
})
export class PaymentFormComponent {
  receiptControl = new FormControl();
  uploadedImageUrl = signal<string | null>(null);
  imageDialogVisible = signal<boolean>(false);

  onFileSelected(file: File | null): void {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.uploadedImageUrl.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      this.uploadedImageUrl.set(null);
    }
  }

  viewImage(): void {
    this.imageDialogVisible.set(true);
  }
}
```

## 🎨 Estados del Componente

### 1. Imagen Cargando

```
┌─────────────────────────────┐
│                             │
│      ⏳ (spinner)           │
│   Cargando imagen...        │
│                             │
└─────────────────────────────┘
```

### 2. Imagen con Error

```
┌─────────────────────────────┐
│                             │
│      ⚠️  (alerta roja)     │
│   Error al cargar imagen    │
│   Verifique la URL...       │
│                             │
└─────────────────────────────┘
```

### 3. Sin Imagen

```
┌─────────────────────────────┐
│                             │
│      🖼️  (icono gris)       │
│   No hay imagen disponible  │
│   No se ha proporcionado... │
│                             │
└─────────────────────────────┘
```

### 4. Imagen Cargada Exitosamente

```
┌─────────────────────────────────────┐
│  Justificante  [−] 125% [+] [↻]  × │
├─────────────────────────────────────┤
│                                     │
│        📷 IMAGEN VISIBLE            │
│        (con zoom aplicado)          │
│                                     │
├─────────────────────────────────────┤
│  [📥 Descargar]          [Cerrar]  │
└─────────────────────────────────────┘
```

## 🔍 Controles de Zoom

| Botón       | Icono             | Acción           | Límite      |
| ----------- | ----------------- | ---------------- | ----------- |
| Alejar      | `pi-search-minus` | Reduce zoom 25%  | Mínimo 50%  |
| Acercar     | `pi-search-plus`  | Aumenta zoom 25% | Máximo 300% |
| Restablecer | `pi-replay`       | Vuelve a 100%    | -           |

**Nota**: Los botones se deshabilitan automáticamente al alcanzar los límites.

## 🌐 Formatos Soportados

El componente soporta todos los formatos de imagen HTML5:

- ✅ **JPEG/JPG** (`.jpg`, `.jpeg`)
- ✅ **PNG** (`.png`)
- ✅ **WebP** (`.webp`)
- ✅ **GIF** (`.gif`)
- ✅ **SVG** (`.svg`)
- ✅ **BMP** (`.bmp`)
- ✅ **ICO** (`.ico`)

⚠️ **Importante**: Este componente está diseñado **SOLO para imágenes**. NO usar para PDFs u otros documentos.

## 💡 Buenas Prácticas

### ✅ Hacer

```typescript
// Título descriptivo
<app-image-viewer-dialog
  [title]="'Justificante de Pago - Factura ' + invoiceNumber"
/>

// Nombre de archivo descriptivo
<app-image-viewer-dialog
  [downloadFilename]="'pago-' + customerId + '-' + date + '.jpg'"
/>

// Manejar URL nula
<app-image-viewer-dialog
  [imageUrl]="payment.receiptUrl ?? null"
/>
```

### ❌ Evitar

```typescript
// Título genérico
<app-image-viewer-dialog [title]="'Imagen'" />

// Nombre genérico
<app-image-viewer-dialog [downloadFilename]="'image.jpg'" />

// No validar URL
<app-image-viewer-dialog [imageUrl]="payment.receiptUrl" /> // puede ser undefined
```

## 🎭 Personalización con CSS

```css
/* Personalizar el diálogo */
::ng-deep .image-viewer-dialog {
  .p-dialog-header {
    background: linear-gradient(to right, #667eea, #764ba2);
    color: white;
  }
}
```

## ⚡ Performance

- **Lazy loading**: La imagen solo se carga cuando el modal está visible
- **Transiciones suaves**: Animación CSS de 200ms para zoom
- **Optimización de re-renders**: Usa signals para reactividad eficiente
- **Memory management**: Limpia el zoom al cerrar el modal

## 🧪 Testing

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageViewerDialogComponent } from './image-viewer-dialog.component';

describe('ImageViewerDialogComponent', () => {
  let component: ImageViewerDialogComponent;
  let fixture: ComponentFixture<ImageViewerDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageViewerDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ImageViewerDialogComponent);
    component = fixture.componentInstance;
  });

  it('should zoom in and out correctly', () => {
    component.zoomIn();
    expect(component.zoomLevel()).toBe(1.25);

    component.zoomOut();
    expect(component.zoomLevel()).toBe(1);
  });

  it('should reset zoom when closing', () => {
    component.zoomLevel.set(2);
    component.onHide();
    expect(component.zoomLevel()).toBe(1);
  });
});
```

## 🔐 Accesibilidad

- ✅ Atributos `alt` descriptivos en imágenes
- ✅ Tooltips en todos los botones de acción
- ✅ Iconos descriptivos (PrimeIcons)
- ✅ Cierre con teclado (tecla ESC)
- ✅ Foco manejado automáticamente por p-dialog
- ✅ Contraste adecuado en modo claro/oscuro

## 📦 Dependencias

- Angular 21+
- PrimeNG (Dialog, Button)
- Tailwind CSS
- PrimeIcons

## 🐛 Solución de Problemas

### Imagen no se muestra

```typescript
// Verificar que la URL es válida
console.log('Image URL:', this.imageUrl());

// Verificar que el modal está visible
console.log('Modal visible:', this.visible());

// Verificar CORS si es URL externa
// Asegurarse de que el servidor permite CORS
```

### Zoom no funciona

```typescript
// El zoom se restablece al cerrar
// Verificar que el modal se mantiene abierto

// Verificar límites de zoom (0.5 - 3.0)
console.log('Zoom level:', component.zoomLevel());
```

### Descarga no funciona

```typescript
// Verificar que downloadable está en true
console.log('Downloadable:', this.downloadable());

// Verificar que la imagen está cargada
console.log('Image loaded:', this.isImageLoaded());

// Verificar permisos del navegador
// Algunos navegadores bloquean descargas automáticas
```

## 📝 Changelog

### Versión 2.0.0 (2026-03-16)

- ✨ Agregado: Controles de zoom (50% - 300%)
- ✨ Agregado: Indicador de porcentaje de zoom
- ✨ Agregado: Botón de reset de zoom
- ✨ Agregado: Estado de loading con spinner
- ✨ Agregado: Estado de error con mensaje descriptivo
- ✨ Agregado: Opción maximizable
- 🎨 Mejorado: UI/UX con mejor contraste de colores
- 🎨 Mejorado: Fondo gris para mejor visualización
- 🐛 Corregido: Zoom se mantiene al cambiar de imagen
- 🐛 Corregido: Reset automático de zoom al cerrar

## 📄 Licencia

Este componente es parte del proyecto Cashly y sigue las mismas políticas de licencia del proyecto principal.
