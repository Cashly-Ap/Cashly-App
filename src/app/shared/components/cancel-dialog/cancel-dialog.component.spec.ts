import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CancelDialogComponent } from './cancel-dialog.component';

describe('CancelDialogComponent', () => {
  let component: CancelDialogComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CancelDialogComponent] });
    component = TestBed.createComponent(CancelDialogComponent).componentInstance;
  });

  it('disables confirmation while the reason is empty', () => {
    component.form.get('reason')?.setValue('');
    expect(component.canConfirm).toBe(false);
    component.form.get('reason')?.setValue('   ');
    expect(component.canConfirm).toBe(false);
  });

  it('enables confirmation when the reason has content', () => {
    component.form.get('reason')?.setValue('Cliente solicitó la cancelación');
    expect(component.canConfirm).toBe(true);
  });

  it('disables confirmation while the cancellation is being saved', () => {
    component.form.get('reason')?.setValue('Motivo válido');
    component.cancellation.loading.set(true);
    expect(component.canConfirm).toBe(false);
  });
});
