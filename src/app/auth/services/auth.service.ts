import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { tap } from 'rxjs';

export interface IAuthUser {
  token: string;
  user: IUser;
  roles: string[];
}

export interface IUser {
  id: number;
  name: string;
  email: string;
  year: '1' | '2' | '3' | '4' | null;
  section: 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | null;
  email_verified_at: null;
  created_at: Date;
  updated_at: Date;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  protected http = inject(HttpClient);

  currentUser = signal<null | undefined | IAuthUser>(undefined);

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
