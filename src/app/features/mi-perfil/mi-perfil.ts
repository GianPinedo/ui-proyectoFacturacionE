import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { AuthService } from '../../core/services/auth.service';
import { AuthUser } from '../../core/models/auth.model';
import { UsuariosService } from '../../core/services/usuarios.service';
import { PageTitleComponent } from '../../shared/components/page-title/page-title';
import { UiButtonComponent } from '../../shared/components/ui-button/ui-button';
import { UiInputComponent } from '../../shared/components/ui-input/ui-input';
import { UiCardComponent } from '../../shared/components/ui-card/ui-card';
import { ChangePasswordPayload } from '../../core/models/usuario.model';

@Component({
  selector: 'app-mi-perfil',
  imports: [ReactiveFormsModule, PageTitleComponent, UiCardComponent, UiInputComponent, UiButtonComponent],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.css',
})
export class MiPerfilComponent {
  private readonly authService = inject(AuthService);
  private readonly usuariosService = inject(UsuariosService);
  private readonly fb = inject(FormBuilder);

  readonly passwordForm = this.fb.nonNullable.group({
    passwordActual: ['', [Validators.required]],
    passwordNuevo: ['', [Validators.required, Validators.minLength(8)]],
    confirmarPassword: ['', [Validators.required]],
  });

  isChangingPassword = false;

  get displayName(): string {
    return this.authService.getDisplayName();
  }

  get roleLabel(): string {
    return this.authService.getRoleLabel();
  }

  get avatarInitials(): string {
    return this.authService.getAvatarInitials();
  }

  get user(): AuthUser | null {
    return this.authService.getUserSnapshot();
  }

  changePassword(): void {
    if (this.passwordForm.invalid || this.isChangingPassword) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { passwordActual, passwordNuevo, confirmarPassword } = this.passwordForm.getRawValue();

    if (passwordNuevo !== confirmarPassword) {
      void Swal.fire({
        title: 'Contraseña no coincide',
        text: 'La nueva contraseña y su confirmación deben ser iguales.',
        icon: 'warning',
        confirmButtonColor: '#00AD8F',
      });
      return;
    }

    this.isChangingPassword = true;

    const payload: ChangePasswordPayload = {
      passwordActual,
      passwordNuevo,
    };

    this.usuariosService.changePassword(payload).subscribe({
      next: () => {
        this.passwordForm.reset({ passwordActual: '', passwordNuevo: '', confirmarPassword: '' });

        void Swal.fire({
          title: 'Contraseña actualizada',
          text: 'Tu contraseña fue cambiada correctamente.',
          icon: 'success',
          confirmButtonColor: '#00AD8F',
        });
      },
      error: (error: unknown) => {
        const message = this.extractErrorMessage(error);

        void Swal.fire({
          title: 'No se pudo cambiar la contraseña',
          text: message || 'Ocurrió un error al actualizar la contraseña.',
          icon: 'error',
          confirmButtonColor: '#00AD8F',
        });
      },
      complete: () => {
        this.isChangingPassword = false;
      },
    });
  }

  private extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    const payload = (error as { error?: unknown; message?: unknown })?.error ?? error;

    if (payload && typeof payload === 'object') {
      const message = (payload as { message?: unknown }).message;

      if (typeof message === 'string') {
        return message;
      }

      if (Array.isArray(message)) {
        return message.join(' ');
      }
    }

    if (typeof payload === 'string') {
      return payload;
    }

    return typeof (error as { message?: unknown })?.message === 'string'
      ? String((error as { message?: unknown }).message)
      : '';
  }
}
