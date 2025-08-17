import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Auth } from './auth/services/auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected auth = inject(Auth);

  protected title = 'lan-exam-web';

  ngOnInit(): void {
    this.auth.initLocalCurrentUser();

    const database = localStorage.getItem('database');

    if (!database) {
      localStorage.setItem(
        'database',
        JSON.stringify({
          users: [
            {
              id: '111',
              name: 'John Doe',
              role: 'student',
              email: 'john.doe@example.com',
              password: 'password',
            },
            {
              id: '222',
              name: 'Jane Smith',
              role: 'teacher',
              email: 'jane.smith@example.com',
              password: 'password',
            },
          ],
        })
      );
    }
  }
}
