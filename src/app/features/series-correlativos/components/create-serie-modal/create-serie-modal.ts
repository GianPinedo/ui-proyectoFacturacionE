import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule, X } from 'lucide-angular';
import { SkeletonComponent } from '../../../../shared/components/skeleton/skeleton.component';
import { UiButtonComponent } from '../../../../shared/components/ui-button/ui-button';

export type SerieFormModalMode = 'create' | 'edit';

export interface SerieFormModalPayload {
  tipoComprobante: string;
  serie: string;
  correlativoActual: number;
  descripcion?: string;
}

export interface SerieFormModalInitialData extends SerieFormModalPayload {}

@Component({
  selector: 'app-create-serie-modal',
  imports: [ReactiveFormsModule, LucideAngularModule, UiButtonComponent, SkeletonComponent],
  templateUrl: './create-serie-modal.html',
  styleUrl: './create-serie-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateSerieModalComponent {
  private readonly fb = inject(FormBuilder);

  readonly mode = input<SerieFormModalMode>('create');
  readonly initialData = input<SerieFormModalInitialData | null>(null);
  readonly isSaving = input(false);
  readonly isLoadingInitialData = input(false);

  readonly cancelRequested = output<void>();
  readonly saveRequested = output<SerieFormModalPayload>();

  readonly closeIcon = X;
  readonly isEditMode = computed(() => this.mode() === 'edit');

  readonly tipoComprobanteOptions = [
    { value: '01', label: '01 - Factura' },
    { value: '03', label: '03 - Boleta' },
    { value: '07', label: '07 - Nota de crédito' },
    { value: '08', label: '08 - Nota de débito' },
  ];

  readonly form = this.fb.nonNullable.group({
    tipoComprobante: ['', [Validators.required, Validators.pattern(/^\d{2}$/)]],
    serie: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9]{1,10}$/), Validators.maxLength(10)]],
    correlativoActual: [0, [Validators.required, Validators.min(0)]],
    descripcion: ['', [Validators.maxLength(150)]],
  });

  constructor() {
    effect(() => {
      const data = this.initialData();

      this.form.reset(
        {
          tipoComprobante: data?.tipoComprobante ?? '',
          serie: data?.serie ?? '',
          correlativoActual: data?.correlativoActual ?? 0,
          descripcion: data?.descripcion ?? '',
        },
        { emitEvent: false },
      );

      this.form.markAsPristine();
      this.form.markAsUntouched();
    });
  }

  close(): void {
    this.cancelRequested.emit();
  }

  submit(): void {
    if (this.form.invalid || this.isSaving() || this.isLoadingInitialData()) {
      this.form.markAllAsTouched();
      return;
    }

    const rawValue = this.form.getRawValue();
    const correlativoActual = Number(rawValue.correlativoActual);

    if (!Number.isInteger(correlativoActual) || correlativoActual < 0) {
      this.form.controls.correlativoActual.setErrors({ min: true });
      return;
    }

    this.saveRequested.emit({
      tipoComprobante: rawValue.tipoComprobante.trim(),
      serie: rawValue.serie.trim().toUpperCase(),
      correlativoActual,
      descripcion: this.emptyToUndefined(rawValue.descripcion),
    });
  }

  private emptyToUndefined(value: string): string | undefined {
    const normalized = value.trim();
    return normalized ? normalized : undefined;
  }
}

