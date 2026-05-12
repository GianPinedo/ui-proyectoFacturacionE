import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule, Eye, EyeOff, X } from 'lucide-angular';
import { UiButtonComponent } from '../../../../shared/components/ui-button/ui-button';
import { SkeletonComponent } from '../../../../shared/components/skeleton/skeleton.component';

export type UserFormModalMode = 'create' | 'edit';

export interface UserFormModalPayload {
  idRol: number;
  nombres: string;
  apellidos: string;
  correo: string;
  username?: string;
  password?: string;
  confirmarPassword?: string;
  estado: boolean;
}

export interface UserFormModalInitialData {
  idRol: number;
  nombres: string;
  apellidos: string;
  correo: string;
  username?: string;
  estado?: boolean;
}

@Component({
  selector: 'app-create-user-modal',
  imports: [ReactiveFormsModule, LucideAngularModule, UiButtonComponent, SkeletonComponent],
  templateUrl: './create-user-modal.html',
  styleUrl: './create-user-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateUserModalComponent {
  private readonly fb = inject(FormBuilder);

  readonly mode = input<UserFormModalMode>('create');
  readonly roleOptions = input<Array<{ id: number; label: string }>>([]);
  readonly isSaving = input(false);
  readonly initialData = input<UserFormModalInitialData | null>(null);
  readonly isLoadingInitialData = input(false);

  readonly cancelRequested = output<void>();
  readonly saveRequested = output<UserFormModalPayload>();

  readonly closeIcon = X;
  readonly eyeIcon = Eye;
  readonly eyeOffIcon = EyeOff;

  readonly showPassword = signal(false);
  readonly showConfirmPassword = signal(false);

  readonly isEditMode = computed(() => this.mode() === 'edit');

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

  constructor() {
    effect(() => {
      const mode = this.mode();
      const data = this.initialData();

      if (mode === 'edit') {
        this.form.controls.username.disable({ emitEvent: false });
        this.form.controls.password.disable({ emitEvent: false });
        this.form.controls.confirmarPassword.disable({ emitEvent: false });

        this.form.patchValue(
          {
            idRol: data?.idRol ?? 0,
            nombres: data?.nombres ?? '',
            apellidos: data?.apellidos ?? '',
            correo: data?.correo ?? '',
            username: data?.username ?? '',
            password: '',
            confirmarPassword: '',
            estado: data?.estado ?? true,
          },
          { emitEvent: false },
        );

        this.showPassword.set(false);
        this.showConfirmPassword.set(false);
        this.form.markAsPristine();
        this.form.markAsUntouched();
        return;
      }

      this.form.controls.username.enable({ emitEvent: false });
      this.form.controls.password.enable({ emitEvent: false });
      this.form.controls.confirmarPassword.enable({ emitEvent: false });

      this.form.reset(
        {
          idRol: 0,
          nombres: '',
          apellidos: '',
          correo: '',
          username: '',
          password: '',
          confirmarPassword: '',
          estado: true,
        },
        { emitEvent: false },
      );

      this.showPassword.set(false);
      this.showConfirmPassword.set(false);
      this.form.markAsPristine();
      this.form.markAsUntouched();
    });
  }

  close(): void {
    this.cancelRequested.emit();
  }

  submit(): void {
    if (this.form.invalid || this.isSaving()) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.isEditMode() && this.passwordMismatch()) {
      this.form.controls.confirmarPassword.setErrors({ mismatch: true });
      return;
    }

    const payload = this.form.getRawValue();

    if (this.isEditMode()) {
      this.saveRequested.emit({
        idRol: Number(payload.idRol),
        nombres: payload.nombres,
        apellidos: payload.apellidos,
        correo: payload.correo,
        estado: payload.estado,
      });
      return;
    }

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
