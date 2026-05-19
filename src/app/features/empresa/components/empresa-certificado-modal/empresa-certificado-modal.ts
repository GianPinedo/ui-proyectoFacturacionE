import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule, X } from 'lucide-angular';
import { UiButtonComponent } from '../../../../shared/components/ui-button/ui-button';

export interface EmpresaCertificadoSubmitPayload {
  file: File;
  clave: string;
  confirmacionClave: string;
}

@Component({
  selector: 'app-empresa-certificado-modal',
  standalone: true,
  imports: [ReactiveFormsModule, LucideAngularModule, UiButtonComponent],
  templateUrl: './empresa-certificado-modal.html',
  styleUrl: './empresa-certificado-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmpresaCertificadoModalComponent {
  private readonly fb = inject(FormBuilder);

  readonly isSaving = input(false);

  readonly cancelRequested = output<void>();
  readonly saveRequested = output<EmpresaCertificadoSubmitPayload>();

  readonly closeIcon = X;
  readonly selectedFileName = signal('');

  readonly form = this.fb.nonNullable.group({
    clave: ['', [Validators.required, Validators.maxLength(100)]],
    confirmacionClave: ['', [Validators.required, Validators.maxLength(100)]],
  });

  private selectedFile: File | null = null;

  close(): void {
    this.cancelRequested.emit();
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (!file) {
      this.selectedFile = null;
      this.selectedFileName.set('');
      return;
    }

    const lowerName = file.name.toLowerCase();
    const isValidExtension = lowerName.endsWith('.pfx') || lowerName.endsWith('.p12');

    if (!isValidExtension) {
      this.selectedFile = null;
      this.selectedFileName.set('');
      this.form.setErrors({ invalidFileType: true });
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      this.selectedFile = null;
      this.selectedFileName.set('');
      this.form.setErrors({ invalidFileSize: true });
      return;
    }

    this.form.setErrors(null);
    this.selectedFile = file;
    this.selectedFileName.set(file.name);
  }

  submit(): void {
    if (this.form.invalid || this.isSaving()) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.selectedFile) {
      this.form.setErrors({ fileRequired: true });
      this.form.markAllAsTouched();
      return;
    }

    const { clave, confirmacionClave } = this.form.getRawValue();

    if (clave !== confirmacionClave) {
      this.form.controls.confirmacionClave.setErrors({ mismatch: true });
      this.form.controls.confirmacionClave.markAsTouched();
      return;
    }

    this.saveRequested.emit({
      file: this.selectedFile,
      clave: clave.trim(),
      confirmacionClave: confirmacionClave.trim(),
    });
  }
}
