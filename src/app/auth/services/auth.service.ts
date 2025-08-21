import { Injectable, signal } from '@angular/core';

export interface IUser {
  id: string;
  username: string;
  password: string;
  name: string;
  role: string;
  section: 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g';
  year: '1' | '2' | '3' | '4';
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  currentUser = signal<null | undefined | IUser>(undefined);
  database = JSON.parse(localStorage.getItem('database') || '{}');

  initLocalCurrentUser() {
    const localCurrentUser = localStorage.getItem('currentUser');

    if (!localCurrentUser) {
      this.currentUser.set(null);
      return;
    }

    this.currentUser.set(JSON.parse(localCurrentUser));
  }

  login(userId: string, password: string): IUser | null {
    const users = this.database.users as IUser[];

    const user = users.find((u) => u.id === userId && u.password === password);

    if (!user) {
      this.currentUser.set(null);
      return null;
    }

    this.currentUser.set(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    return user;
  }

  logout() {
    this.currentUser.set(null);
    localStorage.removeItem('currentUser');
  }
}
