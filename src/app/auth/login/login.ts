import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../services/auth';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  protected formBuilder = inject(FormBuilder);
  protected auth = inject(Auth);

  protected loginForm = this.formBuilder.nonNullable.group({
    userName: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  protected onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { userName, password } = this.loginForm.getRawValue();

    this.auth.login(userName, password);

    console.log(this.loginForm.getRawValue());
  }
}
