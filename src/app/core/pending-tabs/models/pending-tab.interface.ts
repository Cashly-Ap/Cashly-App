export interface PendingTab<T = unknown> {
  id: string;
  title: string;
  route: string;
  formData: T;
  timestamp: number;
  type: 'create' | 'edit';
  module: string;
}
