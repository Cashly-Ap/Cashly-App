export interface PdfViewerConfig {
  url: string;
  title: string;
  fileName?: string;
  params?: Record<string, string>;
}

export interface PdfViewerState {
  visible: boolean;
  loading: boolean;
  error: string | null;
  pdfBlobUrl: string | null;
  config: PdfViewerConfig | null;
}
