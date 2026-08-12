import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FileDownloadHelper } from '@shared/utils/file-download.helper';

describe('FileDownloadHelper', () => {
  let mockLink: HTMLAnchorElement;

  beforeEach(() => {
    mockLink = {
      href: '',
      download: '',
      target: '',
      click: vi.fn(),
    } as unknown as HTMLAnchorElement;

    vi.spyOn(document, 'createElement').mockReturnValue(mockLink as HTMLElement);
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink);
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('downloadFromUrl', () => {
    it('should create link and trigger download', () => {
      const url = 'https://example.com/image.jpg';
      const filename = 'test-image.jpg';

      FileDownloadHelper.downloadFromUrl(url, filename);

      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockLink.href).toBe(url);
      expect(mockLink.download).toBe(filename);
      expect(mockLink.target).toBe('_blank');
      expect(document.body.appendChild).toHaveBeenCalledWith(mockLink);
      expect(mockLink.click).toHaveBeenCalled();
      expect(document.body.removeChild).toHaveBeenCalledWith(mockLink);
    });

    it('should extract filename from url when filename not provided', () => {
      const url = 'https://example.com/path/to/image.jpg';

      FileDownloadHelper.downloadFromUrl(url);

      expect(mockLink.download).toBe('image.jpg');
    });

    it('should use default filename when url has no filename', () => {
      const url = 'https://example.com/';

      FileDownloadHelper.downloadFromUrl(url);

      expect(mockLink.download).toBe('download');
    });
  });

  describe('downloadFromBlob', () => {
    it('should create object URL and download blob', () => {
      const blob = new Blob(['test'], { type: 'image/jpeg' });
      const filename = 'test.jpg';
      const mockUrl = 'blob:http://localhost/test';

      const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue(mockUrl);
      const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL');

      FileDownloadHelper.downloadFromBlob(blob, filename);

      expect(createObjectURLSpy).toHaveBeenCalledWith(blob);
      expect(mockLink.href).toBe(mockUrl);
      expect(mockLink.download).toBe(filename);
      expect(revokeObjectURLSpy).toHaveBeenCalledWith(mockUrl);
    });
  });

  describe('downloadImage', () => {
    it('should fetch and download image as blob', async () => {
      const imageUrl = 'https://example.com/image.jpg';
      const filename = 'downloaded-image.jpg';
      const mockBlob = new Blob(['image data'], { type: 'image/jpeg' });

      global.fetch = vi.fn().mockResolvedValue({
        blob: () => Promise.resolve(mockBlob),
      });

      const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:url');
      const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL');

      await FileDownloadHelper.downloadImage(imageUrl, filename);

      expect(global.fetch).toHaveBeenCalledWith(imageUrl);
      expect(createObjectURLSpy).toHaveBeenCalledWith(mockBlob);
      expect(mockLink.download).toBe(filename);
      expect(revokeObjectURLSpy).toHaveBeenCalled();
    });

    it('should fallback to direct download on fetch error', async () => {
      const imageUrl = 'https://example.com/image.jpg';
      const filename = 'test.jpg';

      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await FileDownloadHelper.downloadImage(imageUrl, filename);

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(mockLink.href).toBe(imageUrl);
      expect(mockLink.download).toBe(filename);
    });

    it('should extract filename from url when not provided', async () => {
      const imageUrl = 'https://example.com/path/to/image.png';
      const mockBlob = new Blob(['image data'], { type: 'image/png' });

      global.fetch = vi.fn().mockResolvedValue({
        blob: () => Promise.resolve(mockBlob),
      });

      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:url');
      vi.spyOn(URL, 'revokeObjectURL');

      await FileDownloadHelper.downloadImage(imageUrl);

      expect(mockLink.download).toBe('image.png');
    });
  });

  describe('getFileExtensionFromMimeType', () => {
    it('should return correct extension for image/jpeg', () => {
      expect(FileDownloadHelper.getFileExtensionFromMimeType('image/jpeg')).toBe('jpg');
    });

    it('should return correct extension for image/png', () => {
      expect(FileDownloadHelper.getFileExtensionFromMimeType('image/png')).toBe('png');
    });

    it('should return correct extension for image/webp', () => {
      expect(FileDownloadHelper.getFileExtensionFromMimeType('image/webp')).toBe('webp');
    });

    it('should return correct extension for application/pdf', () => {
      expect(FileDownloadHelper.getFileExtensionFromMimeType('application/pdf')).toBe('pdf');
    });

    it('should return bin for unknown mime type', () => {
      expect(FileDownloadHelper.getFileExtensionFromMimeType('unknown/type')).toBe('bin');
    });
  });
});
