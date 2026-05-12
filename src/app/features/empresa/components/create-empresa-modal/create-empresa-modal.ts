import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule, X } from 'lucide-angular';
import { UiButtonComponent } from '../../../../shared/components/ui-button/ui-button';
import { SkeletonComponent } from '../../../../shared/components/skeleton/skeleton.component';

export type EmpresaFormModalMode = 'create' | 'edit';

export interface EmpresaFormModalPayload {
  ruc: string;
  razonSocial: string;
  nombreComercial?: string;
  direccion: string;
  ubigeo?: string;
  correo?: string;
  telefono?: string;
}

export interface EmpresaFormModalInitialData extends EmpresaFormModalPayload {}

@Component({
  selector: 'app-create-empresa-modal',
  imports: [ReactiveFormsModule, LucideAngularModule, UiButtonComponent, SkeletonComponent],
  templateUrl: './create-empresa-modal.html',
  styleUrl: './create-empresa-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateEmpresaModalComponent {
  private readonly fb = inject(FormBuilder);

  readonly mode = input<EmpresaFormModalMode>('create');
  readonly initialData = input<EmpresaFormModalInitialData | null>(null);
  readonly isSaving = input(false);
  readonly isLoadingInitialData = input(false);

  readonly cancelRequested = output<void>();
  readonly saveRequested = output<EmpresaFormModalPayload>();

  readonly closeIcon = X;
  readonly isEditMode = computed(() => this.mode() === 'edit');

  readonly form = this.fb.nonNullable.group({
    ruc: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
    razonSocial: ['', [Validators.required, Validators.maxLength(250)]],
    nombreComercial: ['', [Validators.maxLength(250)]],
    direccion: ['', [Validators.required, Validators.maxLength(300)]],
    ubigeo: ['', [Validators.pattern(/^\d{6}$/)]],
    correo: ['', [Validators.email, Validators.maxLength(150)]],
    telefono: ['', [Validators.maxLength(30)]],
  });

  constructor() {
    effect(() => {
      const data = this.initialData();

      this.form.reset(
        {
          ruc: data?.ruc ?? '',
          razonSocial: data?.razonSocial ?? '',
          nombreComercial: data?.nombreComercial ?? '',
          direccion: data?.direccion ?? '',
          ubigeo: data?.ubigeo ?? '',
          correo: data?.correo ?? '',
          telefono: data?.telefono ?? '',
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

    this.saveRequested.emit({
      ruc: rawValue.ruc.trim(),
      razonSocial: rawValue.razonSocial.trim(),
      nombreComercial: this.emptyToUndefined(rawValue.nombreComercial),
      direccion: rawValue.direccion.trim(),
      ubigeo: this.emptyToUndefined(rawValue.ubigeo),
      correo: this.emptyToUndefined(rawValue.correo),
      telefono: this.emptyToUndefined(rawValue.telefono),
    });
  }

  private emptyToUndefined(value: string): string | undefined {
    const normalized = value.trim();
    return normalized ? normalized : undefined;
  }
}

