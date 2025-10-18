import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ExamService } from '../../services/exam.service';
import { Exam } from '../../models/exam';
import {
  faFileAlt,
  faPlayCircle,
  faClipboard,
  faHourglassHalf,
  faEdit,
  faArchive,
  faSpinner,
  faInfoCircle,
  faGraduationCap,
  faClock,
  faTag,
  faCheckCircle,
  faQuestionCircle,
  faStar,
  faCalendarAlt,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-list-exams',
  imports: [RouterLink, DatePipe, FaIconComponent],
  templateUrl: './list-exams.html',
  styleUrl: './list-exams.css',
})
export class ListExams implements OnInit {
  router = inject(Router);
  http = inject(HttpClient);
  examSvc = inject(ExamService);

  fasFileAlt = faFileAlt;
  fasPlayCircle = faPlayCircle;
  fasClipboard = faClipboard;
  faHourglassHalf = faHourglassHalf;
  fasEdit = faEdit;
  fasArchive = faArchive;
  faSpinner = faSpinner;
  fasInfoCircle = faInfoCircle;
  fasGraduationCap = faGraduationCap;
  fasClock = faClock;
  fasTag = faTag;
  faCheckCircle = faCheckCircle;
  faQuestionCircle = faQuestionCircle;
  faStar = faStar;
  faCalendarAlt = faCalendarAlt;
  faExclamationTriangle = faExclamationTriangle;

  exams = signal<Exam[]>([]);
  isLoading = signal(true);

  ngOnInit(): void {
    this.getExams();
  }

  getExams() {
    this.isLoading.set(true);
    this.examSvc.getAll().subscribe({
      next: (res) => {
        this.exams.set(res.data);
        this.isLoading.set(false);
      },
    });
  }

  takeExam(examId: number) {
    this.examSvc.takeExam(examId).subscribe({
      next: (res) => {
        this.router.navigate(['/student/taken-exams', res.data.id, 'continue']);
      },
    });
  }

  // Helper methods for exam details
  getExamDuration(exam: Exam): string {
    const startDate = new Date(exam.starts_at);
    const endDate = new Date(exam.ends_at);
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHours}h ${diffMins}m`;
  }

  getTimeRemaining(exam: Exam): string {
    const endDate = new Date(exam.ends_at);
    const now = new Date();
    const diffMs = endDate.getTime() - now.getTime();

    if (diffMs <= 0) {
      return 'Expired';
    }

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHours}h ${diffMins}m`;
  }

  isExamAvailable(exam: Exam): boolean {
    // Check if status is 'ongoing' (exam is currently active)
    if (exam.status === 'ongoing') {
      return true;
    }

    // Also check if current time is within exam date range
    const now = new Date();
    const startDate = new Date(exam.starts_at);
    const endDate = new Date(exam.ends_at);
    return now >= startDate && now <= endDate;
  }

  getTotalQuestions(exam: Exam): number {
    if (!exam.tos || !Array.isArray(exam.tos)) {
      return 0;
    }
    return exam.tos.reduce(
      (total, topic) => total + (topic.no_of_items || 0),
      0
    );
  }
}
