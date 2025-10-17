import {
  Component,
  inject,
  ChangeDetectionStrategy,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faInfoCircle,
  faGraduationCap,
  faUsers,
  faCalendar,
  faCalendarTimes,
  faClock,
  faStar,
  faTable,
  faBookOpen,
  faSignal,
  faListOl,
  faCog,
  faDatabase,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';
import { ViewExamService } from '../view-exam.service';

@Component({
  selector: 'app-exam-details',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './exam-details.html',
  styleUrl: './exam-details.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExamDetails {
  private viewExamSvc = inject(ViewExamService);

  exam = computed(() => this.viewExamSvc.viewingExam());

  // FontAwesome icons
  faInfoCircle = faInfoCircle;
  faGraduationCap = faGraduationCap;
  faUsers = faUsers;
  faCalendar = faCalendar;
  faCalendarTimes = faCalendarTimes;
  faClock = faClock;
  faStar = faStar;
  faTable = faTable;
  faBookOpen = faBookOpen;
  faSignal = faSignal;
  faListOl = faListOl;
  faCog = faCog;
  faDatabase = faDatabase;
  faCheck = faCheck;

  calculateDuration(startDate: string | Date, endDate: string | Date): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.round((end.getTime() - start.getTime()) / 60000);
  }
}
