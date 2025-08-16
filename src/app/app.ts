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
  }
}
