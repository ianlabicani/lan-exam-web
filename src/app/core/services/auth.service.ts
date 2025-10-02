import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { tap } from 'rxjs';
import { IAuthUser } from '../models/interfaces';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  protected http = inject(HttpClient);

  currentUser = signal<null | undefined | IAuthUser>(undefined);

  authHeader() {
    const token = this.currentUser()?.token.substring(2);
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  initLocalCurrentUser() {
    const localCurrentUser = localStorage.getItem('lan-exam-user');

    if (!localCurrentUser) {
      this.setLanExamUser(null);
      return;
    }

    const parsedUser = JSON.parse(localCurrentUser);
    this.currentUser.set(parsedUser);
  }

  login(email: string, password: string) {
    return this.http
      .post<IAuthUser>('http://127.0.0.1:8000/api/login', {
        email,
        password,
      })
      .pipe(
        tap((user) => {
          this.setLanExamUser(user);
        })
      );
  }

  logout() {
    this.setLanExamUser(null);
  }

  setLanExamUser(authUser: IAuthUser | null) {
    this.currentUser.set(authUser);
    localStorage.setItem('lan-exam-user', JSON.stringify(authUser));
  }
}
