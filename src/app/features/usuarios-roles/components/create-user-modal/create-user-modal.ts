import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule, Eye, EyeOff, X } from 'lucide-angular';
import { UiButtonComponent } from '../../../../shared/components/ui-button/ui-button';

export interface CreateUserModalPayload {
  idRol: number;
  nombres: string;
  apellidos: string;
  correo: string;
  username: string;
  password: string;
  confirmarPassword: string;
  estado: boolean;
}

@Component({
  selector: 'app-create-user-modal',
  imports: [ReactiveFormsModule, LucideAngularModule, UiButtonComponent],
  templateUrl: './create-user-modal.html',
  styleUrl: './create-user-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateUserModalComponent {
  private readonly fb = inject(FormBuilder);

  readonly roleOptions = input<Array<{ id: number; label: string }>>([]);
  readonly isSaving = input(false);

  readonly cancelRequested = output<void>();
  readonly saveRequested = output<CreateUserModalPayload>();

  readonly closeIcon = X;
  readonly eyeIcon = Eye;
  readonly eyeOffIcon = EyeOff;

  readonly showPassword = signal(false);
  readonly showConfirmPassword = signal(false);

  readonly form = this.fb.nonNullable.group({
    idRol: [0, [Validators.required, Validators.min(1)]],
    nombres: ['', [Validators.required, Validators.minLength(2)]],
    apellidos: ['', [Validators.required, Validators.minLength(2)]],
    correo: ['', [Validators.required, Validators.email]],
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)]],
    confirmarPassword: ['', [Validators.required]],
    estado: [true],
  });

  readonly passwordMismatch = computed(() => {
    const { password, confirmarPassword } = this.form.getRawValue();
    return Boolean(password && confirmarPassword && password !== confirmarPassword);
  });

  close(): void {
    this.cancelRequested.emit();
  }

  submit(): void {
    if (this.form.invalid || this.isSaving()) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.passwordMismatch()) {
      this.form.controls.confirmarPassword.setErrors({ mismatch: true });
      return;
    }

    const payload = this.form.getRawValue();
    this.saveRequested.emit({
      ...payload,
      idRol: Number(payload.idRol),
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update((value) => !value);
  }
}
