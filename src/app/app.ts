import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './auth/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected authService = inject(AuthService);

  protected title = 'lan-exam-web';

  ngOnInit(): void {
    this.authService.initLocalCurrentUser();

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
              section: 'f',
              year: '1',
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
