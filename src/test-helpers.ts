import { Provider } from '@angular/core';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';

export function getTestProviders(): Provider[] {
  return [MessageService, DialogService];
}

export function getMockMessageService() {
  return {
    add: () => {},
    clear: () => {},
    addAll: () => {},
  };
}

export function getMockDialogService() {
  return {
    open: () => ({ onClose: { subscribe: () => {} } }),
  };
}
