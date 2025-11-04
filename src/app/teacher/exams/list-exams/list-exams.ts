import { CommonModule, DatePipe } from '@angular/common';
import {
  Component,
  inject,
  OnInit,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ErrorModal } from '../../../shared/components/error-modal/error-modal';
import { DeleteConfirmationModal } from '../../../shared/components/delete-confirmation-modal/delete-confirmation-modal';
import {
  faPlus,
  faEye,
  faTrash,
  faCalendar,
  faQuestion,
  faStar,
  faPencil,
  faArchive,
  faCheckCircle,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-exam-list',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    CommonModule,
    FontAwesomeModule,
    ErrorModal,
    DeleteConfirmationModal,
  ],
  templateUrl: './list-exams.html',
  styleUrl: './list-exams.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListExams implements OnInit {
  http = inject(HttpClient);
  protected readonly Array = Array;

  exams = signal<GetExamsData[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  deleteModalOpen = signal(false);
  examToDelete = signal<{ id: number; title: string } | null>(null);

  // FontAwesome icons
  faPlus = faPlus;
  faEye = faEye;
  faTrash = faTrash;
  faCalendar = faCalendar;
  faQuestion = faQuestion;
  faStar = faStar;
  faPencil = faPencil;
  faArchive = faArchive;
  faCheckCircle = faCheckCircle;

  ngOnInit(): void {
    this.loadExams();
  }

  loadExams() {
    this.loading.set(true);
    this.error.set(null);

    const url = `${environment.apiBaseUrl}/teacher/exams`;
    this.http
      .get<{
        data: GetExamsData[];
        meta?: { total: number; current_page: number; per_page: number };
      }>(url)
      .subscribe({
        next: (res) => {
          const examsWithDuration = res.data.map((exam) => ({
            ...exam,
            durationInMins: this.calculateDuration(
              exam.starts_at,
              exam.ends_at
            ),
            durationDisplay: this.formatDuration(exam.starts_at, exam.ends_at),
          }));

          this.exams.set(examsWithDuration);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err?.error?.message || 'Failed to load exams');
          this.loading.set(false);
        },
      });
  }

  private calculateDuration(
    startsAt: Date | string,
    endsAt: Date | string
  ): number {
    const start = new Date(startsAt);
    const end = new Date(endsAt);
    const diffMs = end.getTime() - start.getTime();
    return Math.round(diffMs / 60000); // Convert ms to minutes
  }

  private formatDuration(
    startsAt: Date | string,
    endsAt: Date | string
  ): string {
    const start = new Date(startsAt);
    const end = new Date(endsAt);
    const diffMs = end.getTime() - start.getTime();
    const totalMinutes = Math.round(diffMs / 60000);

    if (totalMinutes < 60) {
      return `${totalMinutes} mins`;
    }

    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    if (hours < 24) {
      return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`;
    }

    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;

    return `${days}d ${remainingHours}h`;
  }

  openDeleteModal(examId: number, examTitle: string) {
    this.examToDelete.set({ id: examId, title: examTitle });
    this.deleteModalOpen.set(true);
  }

  confirmDelete() {
    const exam = this.examToDelete();
    if (!exam) return;

    this.deleteModalOpen.set(false);
    this.http
      .delete(`${environment.apiBaseUrl}/teacher/exams/${exam.id}`)
      .subscribe({
        next: () => {
          this.exams.update((exams) => exams.filter((e) => e.id !== exam.id));
          this.examToDelete.set(null);
        },
        error: () => {
          this.error.set('Failed to delete exam');
          this.examToDelete.set(null);
        },
      });
  }

  cancelDelete() {
    this.deleteModalOpen.set(false);
    this.examToDelete.set(null);
  }

  closeErrorModal(): void {
    this.error.set(null);
  }
}

interface GetExamsData {
  id: number;
  title: string;
  description: string;
  starts_at: Date;
  ends_at: Date;
  year: string | string[];
  sections: string[];
  status: string;
  total_points: number;
  created_at: Date;
  updated_at: Date;
  items?: any[]; // Array of exam items/questions

  // Additional properties for duration in minutes and display
  durationInMins?: number;
  durationDisplay?: string;
}
