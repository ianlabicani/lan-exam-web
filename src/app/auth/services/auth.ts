import { Injectable, signal } from '@angular/core';

export interface IUser {
  id: number;
  username: string;
  password: string;
  name: string;
  role: string;
}

@Injectable({
  providedIn: 'root',
})
export class Auth {
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

  login(username: string, password: string): void {
    const users = this.database.users as IUser[];

    const user = users.find(
      (u) => u.username === username && u.password === password
    );
    if (user) {
      this.currentUser.set(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      this.currentUser.set(null);
      console.log('Login failed');
    }
  }

  logout() {
    this.currentUser.set(null);
    localStorage.removeItem('currentUser');
  }
}
