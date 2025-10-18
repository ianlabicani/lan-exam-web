import {
  Component,
  inject,
  ChangeDetectionStrategy,
  signal,
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
  faEdit,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { ViewExamService } from '../view-exam.service';
import { EditExam, EditExamData } from './edit-exam/edit-exam';

@Component({
  selector: 'app-exam-details',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, EditExam],
  templateUrl: './exam-details.html',
  styleUrl: './exam-details.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExamDetails {
  private viewExamSvc = inject(ViewExamService);

  exam = this.viewExamSvc.viewingExam;

  // Edit mode state
  isEditing = signal(false);

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
  faEdit = faEdit;
  faTimes = faTimes;

  toggleEditMode(): void {
    this.isEditing.update((val) => !val);
  }

  onEditSubmitted(updatedExam: EditExamData): void {
    // Update the parent service
    this.viewExamSvc.patchViewingExam(updatedExam as any);
    this.isEditing.set(false);
  }

  onEditCancelled(): void {
    this.isEditing.set(false);
  }

  calculateDuration(startDate: string | Date, endDate: string | Date): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.round((end.getTime() - start.getTime()) / 60000);
  }
}
