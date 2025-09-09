import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe, NgClass, TitleCasePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { ExamCard } from './exam-card/exam-card';
import { ITakenExam } from './take-exam/take-exam';
import { Exam } from '../../teacher/services/exam.service';

@Component({
  selector: 'app-exams',
  imports: [NgClass, DatePipe, TitleCasePipe, RouterLink],
  templateUrl: './exams.html',
  styleUrl: './exams.css',
})
export class Exams implements OnInit {
  http = inject(HttpClient);
  examsSig = signal<(Exam & { taken_exams: ITakenExam[] })[]>([]);
  auth = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    this.getExams().subscribe((response) => {
      this.examsSig.set(
        response.exams as (Exam & {
          taken_exams: ITakenExam[];
        })[]
      );
    });
  }

  private getExams() {
    return this.http.get<{ exams: Exam[] }>(
      'http://127.0.0.1:8000/api/student/exams'
    );
  }

  goTo(exam: Exam) {
    if (exam.status !== 'active') return;
    this.router.navigate(['/student/take-exam', exam.id]);
  }

  cardIcon(exam: Exam): { bg: string; icon: string; color: string } {
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
}
