import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LogoutButton } from '../../auth/logout-button/logout-button';

@Component({
  selector: 'app-student-navbar',
  imports: [RouterLink, LogoutButton],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  authService = inject(AuthService);
  router = inject(Router);

  userSig = this.authService.currentUser;
  mobileMenuOpen = signal(false);

  initials = computed(() => {
    const u = this.userSig()?.user;
    if (!u || !u.name) return 'NA';
    const parts = u.name.trim().split(/\s+/);
    return parts
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() || '')
      .join('');
  });

  toggleMobileMenu() {
    this.mobileMenuOpen.update((v) => !v);
  }

  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
