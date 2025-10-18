import {
  Component,
  signal,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { LogoutButton } from '../../auth/logout-button/logout-button';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faBars,
  faTimes,
  faGraduationCap,
  faHome,
  faFileAlt,
  faChartLine,
  faClipboardCheck,
  faUserClock,
  faBell,
  faExclamationTriangle,
  faCheckCircle,
  faCalendarAlt,
  faUserCircle,
  faCog,
  faQuestionCircle,
  faSignOutAlt,
  faChevronDown,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-teacher-navbar',
  imports: [RouterLink, RouterLinkActive, LogoutButton, FaIconComponent],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar {
  private router = inject(Router);

  // Icons
  protected readonly faBars = faBars;
  protected readonly faTimes = faTimes;
  protected readonly faGraduationCap = faGraduationCap;
  protected readonly faHome = faHome;
  protected readonly faFileAlt = faFileAlt;
  protected readonly faChartLine = faChartLine;
  protected readonly faClipboardCheck = faClipboardCheck;
  protected readonly faUserClock = faUserClock;
  protected readonly faBell = faBell;
  protected readonly faExclamationTriangle = faExclamationTriangle;
  protected readonly faCheckCircle = faCheckCircle;
  protected readonly faCalendarAlt = faCalendarAlt;
  protected readonly faUserCircle = faUserCircle;
  protected readonly faCog = faCog;
  protected readonly faQuestionCircle = faQuestionCircle;
  protected readonly faSignOutAlt = faSignOutAlt;
  protected readonly faChevronDown = faChevronDown;

  // State
  protected mobileMenuOpen = signal(false);
  protected notificationsOpen = signal(false);
  protected profileMenuOpen = signal(false);
  protected logoutModalOpen = signal(false);

  protected toggleMobileMenu(): void {
    this.mobileMenuOpen.update((value) => !value);
  }

  protected closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  protected toggleNotifications(): void {
    this.notificationsOpen.update((value) => !value);
    this.profileMenuOpen.set(false);
  }

  protected toggleProfileMenu(): void {
    this.profileMenuOpen.update((value) => !value);
    this.notificationsOpen.set(false);
  }

  protected openLogoutModal(): void {
    this.logoutModalOpen.set(true);
    this.profileMenuOpen.set(false);
  }

  protected closeLogoutModal(): void {
    this.logoutModalOpen.set(false);
  }

  protected closeDropdowns(): void {
    this.notificationsOpen.set(false);
    this.profileMenuOpen.set(false);
  }
}
