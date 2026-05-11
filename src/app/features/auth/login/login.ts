import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { LucideAngularModule, Eye, EyeOff } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';
import { UiInputComponent } from '../../../shared/components/ui-input/ui-input';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, UiInputComponent, LucideAngularModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  readonly eyeIcon = Eye;
  readonly eyeOffIcon = EyeOff;
  isSubmitting = false;
  errorMessage = '';
  showPassword = false;

  readonly form = this.fb.nonNullable.group({
    user: ['mlabajos123', [Validators.required]],
    password: ['Mlabajos123!', [Validators.required]],
  });

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  submit(): void {
    if (this.form.invalid || this.isSubmitting) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage = '';
    this.isSubmitting = true;

    const { user, password } = this.form.getRawValue();

    this.authService
      .login(user, password)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => {
          this.router.navigateByUrl('/inicio');
        },
        error: (error: unknown) => {
          const apiMessage = this.extractErrorMessage(error);
          this.errorMessage = apiMessage || 'Credenciales inválidas o servicio no disponible.';
          this.form.setErrors({ loginFailed: true });
        },
      });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  private extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === 'string') {
      return error;
    }

    const payload = (error as { error?: unknown; message?: unknown })?.error ?? error;

    if (typeof payload === 'string') {
      return payload;
    }

    if (payload && typeof payload === 'object') {
      const message = (payload as { message?: unknown }).message;

      if (Array.isArray(message)) {
        return message.join(' ');
      }

      if (typeof message === 'string') {
        return message;
      }
    }

    const fallbackMessage = (error as { message?: unknown })?.message;

    return typeof fallbackMessage === 'string' ? fallbackMessage : '';
  }
}
