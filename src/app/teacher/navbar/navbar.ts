import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LogoutButton } from '../../auth/logout-button/logout-button';
@Component({
  selector: 'app-teacher-navbar',
  imports: [RouterLink, LogoutButton],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {}
