import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  protected formBuilder = inject(FormBuilder);
  protected auth = inject(Auth);
  protected router = inject(Router);

  protected loginForm = this.formBuilder.nonNullable.group({
    userId: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  protected onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { userId, password } = this.loginForm.getRawValue();

    const user = this.auth.login(userId, password);
    if (!user) {
      this.loginForm.setErrors({ invalidLogin: true });
      return;
    }

    if (user.role === 'teacher') {
      this.router.navigate(['/teacher/dashboard']);
    } else if (user.role === 'student') {
      this.router.navigate(['/student/dashboard']);
    }
  }
}
