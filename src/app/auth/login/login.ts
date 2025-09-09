import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, FaIconComponent],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  protected formBuilder = inject(FormBuilder);
  protected authService = inject(AuthService);
  protected router = inject(Router);

  protected loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  protected isSigningInSig = signal(false);
  protected errorMessageSig = signal<string | null>(null);
  protected faSpinner = faSpinner;

  ngOnInit(): void {
    const currentUser = this.authService.currentUser();
    if (currentUser) {
      if (currentUser.roles.includes('teacher')) {
        this.router.navigate(['/teacher/dashboard']);
      } else if (currentUser.roles.includes('student')) {
        this.router.navigate(['/student/dashboard']);
      }
    }
  }

  protected onSubmit() {
    this.isSigningInSig.set(true);
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.isSigningInSig.set(false);
      return;
    }

    const { email, password } = this.loginForm.getRawValue();
    this.authService.login(email, password).subscribe({
      next: (authUser) => {
        this.authService.setLanExamUser(authUser);
        this.router.navigate(['/student/dashboard']);
        this.isSigningInSig.set(false);

        if (authUser.roles.includes('teacher')) {
          this.router.navigate(['/teacher/dashboard']);
        } else if (authUser.roles.includes('student')) {
          this.router.navigate(['/student/dashboard']);
        }
      },
      error: (err) => {
        this.isSigningInSig.set(false);
        this.errorMessageSig.set(
          err.error.message || 'Login failed. Please try again.'
        );
      },
    });
  }
}
