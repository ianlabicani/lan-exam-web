import {
  faSpinner,
  faGraduationCap,
  faEnvelope,
  faLock,
  faEye,
  faEyeSlash,
  faSignInAlt,
  faArrowLeft,
  faCheckCircle,
  faExclamationCircle,
} from '@fortawesome/free-solid-svg-icons';
import {
  Component,
  inject,
  OnInit,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, FontAwesomeModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  protected showPasswordSig = signal(false);

  // FontAwesome icons
  protected readonly faSpinner = faSpinner;
  protected readonly faGraduationCap = faGraduationCap;
  protected readonly faEnvelope = faEnvelope;
  protected readonly faLock = faLock;
  protected readonly faEye = faEye;
  protected readonly faEyeSlash = faEyeSlash;
  protected readonly faSignInAlt = faSignInAlt;
  protected readonly faArrowLeft = faArrowLeft;
  protected readonly faCheckCircle = faCheckCircle;
  protected readonly faExclamationCircle = faExclamationCircle;

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

  protected togglePassword(): void {
    this.showPasswordSig.update((value) => !value);
  }

  protected onSubmit(): void {
    this.isSigningInSig.set(true);
    this.errorMessageSig.set(null);

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.isSigningInSig.set(false);
      return;
    }

    const { email, password } = this.loginForm.getRawValue();
    this.authService.login(email, password).subscribe({
      next: (authUser) => {
        this.authService.setLanExamUser(authUser);
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
