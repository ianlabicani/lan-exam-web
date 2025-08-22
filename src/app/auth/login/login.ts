import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  protected formBuilder = inject(FormBuilder);
  protected authService = inject(AuthService);
  protected router = inject(Router);

  protected loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  protected onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.loginForm.getRawValue();
    this.authService.login(email, password).subscribe({
      next: (authUser) => {
        this.authService.setLanExamUser(authUser);
        this.router.navigate(['/student/dashboard']);

        if (authUser.roles.includes('teacher')) {
          this.router.navigate(['/teacher/dashboard']);
        } else if (authUser.roles.includes('s udent')) {
          this.router.navigate(['/student/dashboard']);
        }
      },
      error: () => {
        this.loginForm.setErrors({ invalidLogin: true });
      },
    });
  }
}
