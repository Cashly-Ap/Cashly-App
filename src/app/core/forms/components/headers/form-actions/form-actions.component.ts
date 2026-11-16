import {
  AfterViewInit,
  Component,
  DestroyRef,
  inject,
  input,
  output,
  signal,
  computed,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, ControlContainer, FormArray, FormGroup } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { TooltipModule } from 'primeng/tooltip';
import { CancelButtonComponent } from '@shared/components/ui/cancel-button/cancel-button.component';

import { SubmitButtonComponent } from '@shared/components/ui/submit-button/submit-button.component';
import { cloneValue, deepEqual } from '@shared/utils/value-comparison';
import { TranslationService } from '@core/i18n/translation.service';
import { fieldLabelKey, requiredFieldsMessage } from '@core/forms/utils/required-fields';
@Component({
  selector: 'app-form-actions',
  standalone: true,
  imports: [SubmitButtonComponent, TooltipModule, CancelButtonComponent],
  templateUrl: './form-actions.component.html',
})
export class FormActionsComponent implements AfterViewInit {
  private readonly controlContainer = inject(ControlContainer, { optional: true });
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly translations = inject(TranslationService);

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  private readonly hasChanges = signal(false);
  private readonly invalidFieldKeys = signal<string[]>([]);
  private baseline: unknown;
  private formSubscription?: Subscription;

  submitLabel = input<string>('Guardar');
  cancelLabel = input<string>('Cancelar');
  loading = input<boolean>(false);
  disabled = input<boolean>(false);
  tooltipMessage = input<string>('');

  readonly isEditRoute = computed(() =>
    this.currentUrl().split('?')[0].split('#')[0].endsWith('/edit'),
  );
  readonly noChanges = computed(() => this.isEditRoute() && !this.hasChanges());
  readonly submitDisabled = computed(() => this.disabled() || this.noChanges());
  readonly resolvedTooltip = computed(() => {
    if (!this.submitDisabled()) return '';
    if (this.tooltipMessage()) return this.tooltipMessage();
    const keys = this.invalidFieldKeys();
    if (keys.length > 0) return requiredFieldsMessage(this.translations, keys);
    if (this.noChanges()) return '';
    return this.translations.t('shared.completeRequiredFields');
  });

  cancel = output<void>();

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.bindForm());
    this.destroyRef.onDestroy(() => this.formSubscription?.unsubscribe());
  }

  ngAfterViewInit(): void {
    this.bindForm();
  }

  private bindForm(): void {
    const control = this.controlContainer?.control;
    this.formSubscription?.unsubscribe();
    if (!control) {
      this.baseline = undefined;
      this.hasChanges.set(false);
      this.invalidFieldKeys.set([]);
      return;
    }
    this.baseline = cloneValue(control.getRawValue());
    this.hasChanges.set(false);
    this.updateInvalidFields(control);
    this.formSubscription = control.events.subscribe(() => {
      const current = control.getRawValue();
      this.updateInvalidFields(control);
      if (control.pristine) {
        this.baseline = cloneValue(current);
        this.hasChanges.set(false);
        return;
      }
      this.hasChanges.set(!deepEqual(current, this.baseline));
    });
  }

  private updateInvalidFields(control: AbstractControl): void {
    this.invalidFieldKeys.set([...new Set(this.collectInvalidKeys(control))]);
  }

  private collectInvalidKeys(control: AbstractControl | null): string[] {
    if (!control) return [];
    if (control instanceof FormGroup) {
      return Object.entries(control.controls).flatMap(([name, child]) =>
        this.collectInvalidKeysFor(name, child),
      );
    }
    if (control instanceof FormArray) {
      return control.controls.flatMap((child) => this.collectInvalidKeys(child));
    }
    if (!control.invalid) return [];
    const key = fieldLabelKey(control.parent ? this.controlName(control) : '');
    return key ? [key] : [];
  }

  private collectInvalidKeysFor(name: string, control: AbstractControl): string[] {
    if (control instanceof FormGroup) {
      return Object.entries(control.controls).flatMap(([childName, child]) =>
        this.collectInvalidKeysFor(childName, child),
      );
    }
    if (control instanceof FormArray) {
      return control.controls.flatMap((child) => this.collectInvalidKeysFor(name, child));
    }
    if (!control.invalid) return [];
    const key = fieldLabelKey(name);
    return key ? [key] : [];
  }

  private controlName(control: AbstractControl): string {
    const parent = control.parent;
    if (!parent) return '';
    return Object.entries(parent.controls).find(([, child]) => child === control)?.[0] ?? '';
  }
}
