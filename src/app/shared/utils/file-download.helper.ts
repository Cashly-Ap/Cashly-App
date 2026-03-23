export class FileDownloadHelper {
  static downloadFromUrl(url: string, filename?: string): void {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || this.extractFilenameFromUrl(url);
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  static downloadFromBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    this.downloadFromUrl(url, filename);
    URL.revokeObjectURL(url);
  }

  static async downloadImage(imageUrl: string, filename?: string): Promise<void> {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const actualFilename = filename || this.extractFilenameFromUrl(imageUrl);
      this.downloadFromBlob(blob, actualFilename);
    } catch (error) {
      console.error('Error al descargar la imagen:', error);
      this.downloadFromUrl(imageUrl, filename);
    }
  }

  private static extractFilenameFromUrl(url: string): string {
    try {
      const urlObject = new URL(url);
      const pathname = urlObject.pathname;
      const segments = pathname.split('/');
      const filename = segments[segments.length - 1];
      return filename || 'download';
    } catch {
      return 'download';
    }
  }

  static getFileExtensionFromMimeType(mimeType: string): string {
    const mimeMap: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'image/svg+xml': 'svg',
      'application/pdf': 'pdf',
    };
    return mimeMap[mimeType] || 'bin';
  }
}
