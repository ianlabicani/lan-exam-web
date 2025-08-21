import { Component, inject, OnInit, signal } from '@angular/core';
import { IExam } from '../../teacher/exams/exams';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-exams',
  imports: [DatePipe, TitleCasePipe],
  templateUrl: './exams.html',
  styleUrl: './exams.css',
})
export class Exams implements OnInit {
  exams = signal<IExam[]>([]);
  auth = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    const exams = localStorage.getItem('exams');
    if (!exams) {
      this.exams.set([]);
    } else {
      const currentUser = this.auth.currentUser();
      const userExams = JSON.parse(exams).filter(
        (exam: IExam) =>
          exam.year === currentUser?.year &&
          exam.section === currentUser?.section
      );
      this.exams.set(userExams);
    }
  }

  statusBadgeClass(status: IExam['status']): string {
    const map: Record<IExam['status'], string> = {
      draft: 'bg-gray-100 text-gray-700',
      published: 'bg-green-100 text-green-700',
      archived: 'bg-yellow-100 text-yellow-800',
      active: 'bg-blue-100 text-blue-700',
    };
    return map[status];
  }

  actionText(exam: IExam): string {
    // Lifecycle reference:
    // draft -> published -> active -> archived (terminal)
    // Students can only take exams during 'active'.
    switch (exam.status) {
      case 'draft':
        return 'Locked';
      case 'published':
        return 'Scheduled'; // not yet open for students
      case 'active':
        return 'Start Exam'; // could later switch to 'Continue' if attempt stored
      case 'archived':
        return 'Review';
      default:
        return 'Open';
    }
  }

  actionDisabled(exam: IExam): boolean {
    // disable unless exam is active (only active is actionable)
    return exam.status !== 'active';
  }

  buttonClass(exam: IExam): string {
    const base =
      'w-full font-medium py-2 px-4 rounded-md transition-colors duration-200 text-white disabled:opacity-60 disabled:cursor-not-allowed';
    switch (exam.status) {
      case 'draft':
        return base + ' bg-gray-400';
      case 'published':
        return base + ' bg-indigo-500';
      case 'active':
        return base + ' bg-blue-600 hover:bg-blue-700';
      case 'archived':
        return base + ' bg-yellow-500 hover:bg-yellow-600';
      default:
        return base + ' bg-gray-500';
    }
  }

  goTo(exam: IExam) {
    if (this.actionDisabled(exam)) return;
    this.router.navigate(['/student/take-exam', exam.id]);
  }

  cardIcon(exam: IExam): { bg: string; icon: string; color: string } {
    switch (exam.status) {
      case 'published':
      case 'active':
        return {
          bg: 'bg-blue-100',
          icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
          color: 'text-blue-600',
        };
      case 'archived':
        return {
          bg: 'bg-yellow-100',
          icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
          color: 'text-yellow-600',
        };
      case 'draft':
      default:
        return {
          bg: 'bg-gray-100',
          icon: 'M9 19V6a2 2 0 012-2h2a2 2 0 012 2v13m-6 0a2 2 0 002 2h2a2 2 0 002-2',
          color: 'text-gray-600',
        };
    }
  }

  durationMinutes(exam: IExam): number | null {
    if (exam.duration) return exam.duration;
    if (exam.startsAt && exam.endsAt) {
      const start = new Date(exam.startsAt).getTime();
      const end = new Date(exam.endsAt).getTime();
      if (end > start) return Math.round((end - start) / 60000);
    }
    return null;
  }
}
