import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule, X } from 'lucide-angular';
import { EmpresaCredencialesRequest } from '../../../../core/models/empresa.model';
import { UiButtonComponent } from '../../../../shared/components/ui-button/ui-button';

@Component({
  selector: 'app-empresa-credenciales-modal',
  standalone: true,
  imports: [ReactiveFormsModule, LucideAngularModule, UiButtonComponent],
  templateUrl: './empresa-credenciales-modal.html',
  styleUrl: './empresa-credenciales-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmpresaCredencialesModalComponent {
  private readonly fb = inject(FormBuilder);

  readonly isSaving = input(false);

  readonly cancelRequested = output<void>();
  readonly saveRequested = output<EmpresaCredencialesRequest>();

  readonly closeIcon = X;

  readonly form = this.fb.nonNullable.group({
    usuarioSol: ['', [Validators.required, Validators.maxLength(100)]],
    claveSol: ['', [Validators.required, Validators.maxLength(100)]],
    confirmacionClaveSol: ['', [Validators.required, Validators.maxLength(100)]],
  });

  close(): void {
    this.cancelRequested.emit();
  }

  submit(): void {
    if (this.form.invalid || this.isSaving()) {
      this.form.markAllAsTouched();
      return;
    }

    const { usuarioSol, claveSol, confirmacionClaveSol } = this.form.getRawValue();

    if (claveSol !== confirmacionClaveSol) {
      this.form.controls.confirmacionClaveSol.setErrors({ mismatch: true });
      this.form.controls.confirmacionClaveSol.markAsTouched();
      return;
    }

    this.saveRequested.emit({
      usuarioSol: usuarioSol.trim(),
      claveSol: claveSol.trim(),
      confirmacionClaveSol: confirmacionClaveSol.trim(),
    });
  }
}
