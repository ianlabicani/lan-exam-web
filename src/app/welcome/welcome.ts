import {
  Component,
  signal,
  ChangeDetectionStrategy,
  inject,
  computed,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faGraduationCap,
  faSignInAlt,
  faChalkboardTeacher,
  faUserGraduate,
  faUserShield,
  faStar,
  faLock,
  faEye,
  faTasks,
  faCalendarAlt,
  faChartLine,
  faCheckCircle,
  faListAlt,
  faCheckSquare,
  faToggleOn,
  faPencilAlt,
  faLink,
  faFileAlt,
  faEdit,
  faRocket,
  faCopyright,
} from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-welcome',
  imports: [RouterLink, FontAwesomeModule],
  templateUrl: './welcome.html',
  styleUrl: './welcome.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Welcome {
  protected authService = inject(AuthService);
  protected router = inject(Router);

  // FontAwesome icons
  protected readonly faGraduationCap = faGraduationCap;
  protected readonly faSignInAlt = faSignInAlt;
  protected readonly faChalkboardTeacher = faChalkboardTeacher;
  protected readonly faUserGraduate = faUserGraduate;
  protected readonly faUserShield = faUserShield;
  protected readonly faStar = faStar;
  protected readonly faLock = faLock;
  protected readonly faEye = faEye;
  protected readonly faTasks = faTasks;
  protected readonly faCalendarAlt = faCalendarAlt;
  protected readonly faChartLine = faChartLine;
  protected readonly faCheckCircle = faCheckCircle;
  protected readonly faListAlt = faListAlt;
  protected readonly faCheckSquare = faCheckSquare;
  protected readonly faToggleOn = faToggleOn;
  protected readonly faPencilAlt = faPencilAlt;
  protected readonly faLink = faLink;
  protected readonly faFileAlt = faFileAlt;
  protected readonly faEdit = faEdit;
  protected readonly faRocket = faRocket;
  protected readonly faCopyright = faCopyright;

  protected readonly currentYear = signal(new Date().getFullYear());

  // Computed signal to check if user is authenticated
  protected isAuthenticated = computed(() => {
    const user = this.authService.currentUser();
    return user !== null && user !== undefined;
  });

  // Computed signal to get the dashboard path based on user role
  protected dashboardPath = computed(() => {
    const user = this.authService.currentUser();
    if (user?.roles?.includes('teacher')) {
      return '/teacher/dashboard';
    }
    if (user?.roles?.includes('student')) {
      return '/student/dashboard';
    }
    return '/';
  });
}
