import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule, X } from 'lucide-angular';
import { EmpresaCreateRequest, EmpresaUpdateRequest } from '../../../../core/models/empresa.model';
import { SkeletonComponent } from '../../../../shared/components/skeleton/skeleton.component';
import { UiButtonComponent } from '../../../../shared/components/ui-button/ui-button';

export type EmpresaFormModalMode = 'create' | 'edit';

export interface EmpresaFormModalData extends EmpresaCreateRequest {}

export interface EmpresaFormModalSubmitPayload {
  createRequest: EmpresaCreateRequest;
  updateRequest: EmpresaUpdateRequest;
}

@Component({
  selector: 'app-empresa-form-modal',
  standalone: true,
  imports: [ReactiveFormsModule, LucideAngularModule, UiButtonComponent, SkeletonComponent],
  templateUrl: './empresa-form-modal.html',
  styleUrl: './empresa-form-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmpresaFormModalComponent {
  private readonly fb = inject(FormBuilder);

  readonly mode = input<EmpresaFormModalMode>('create');
  readonly initialData = input<EmpresaFormModalData | null>(null);
  readonly isSaving = input(false);
  readonly isLoadingInitialData = input(false);

  readonly cancelRequested = output<void>();
  readonly saveRequested = output<EmpresaFormModalSubmitPayload>();

  readonly closeIcon = X;
  readonly isEditMode = computed(() => this.mode() === 'edit');

  readonly form = this.fb.nonNullable.group({
    ruc: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
    razonSocial: ['', [Validators.required, Validators.maxLength(250)]],
    nombreComercial: ['', [Validators.maxLength(250)]],
    direccion: ['', [Validators.required, Validators.maxLength(300)]],
    ubigeo: ['', [Validators.pattern(/^\d{6}$/)]],
    departamento: ['', [Validators.maxLength(100)]],
    provincia: ['', [Validators.maxLength(100)]],
    distrito: ['', [Validators.maxLength(100)]],
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
          departamento: data?.departamento ?? '',
          provincia: data?.provincia ?? '',
          distrito: data?.distrito ?? '',
          correo: data?.correo ?? '',
          telefono: data?.telefono ?? '',
        },
        { emitEvent: false },
      );

      if (this.isEditMode()) {
        this.form.controls.ruc.disable({ emitEvent: false });
      } else {
        this.form.controls.ruc.enable({ emitEvent: false });
      }

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

    const raw = this.form.getRawValue();

    const createRequest: EmpresaCreateRequest = {
      ruc: raw.ruc.trim(),
      razonSocial: raw.razonSocial.trim(),
      nombreComercial: this.emptyToUndefined(raw.nombreComercial),
      direccion: raw.direccion.trim(),
      ubigeo: this.emptyToUndefined(raw.ubigeo),
      departamento: this.emptyToUndefined(raw.departamento),
      provincia: this.emptyToUndefined(raw.provincia),
      distrito: this.emptyToUndefined(raw.distrito),
      correo: this.emptyToUndefined(raw.correo),
      telefono: this.emptyToUndefined(raw.telefono),
    };

    const { ruc: _unused, ...updateRequest } = createRequest;

    this.saveRequested.emit({
      createRequest,
      updateRequest,
    });
  }

  private emptyToUndefined(value: string): string | undefined {
    const normalized = value.trim();
    return normalized ? normalized : undefined;
  }
}
