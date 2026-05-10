import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UiButtonComponent } from '../../../shared/components/ui-button/ui-button';
import { UiInputComponent } from '../../../shared/components/ui-input/ui-input';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, UiInputComponent, UiButtonComponent],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    user: [''],
    password: [''],
  });

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  submit(): void {
    const { user, password } = this.form.getRawValue();
    this.authService.login(user, password);
    this.router.navigateByUrl('/inicio');
  }
}
