import { Component, inject, OnInit, signal } from '@angular/core';
import { ITakenExamAnswer } from '../../services/student-exam.service';
import { Exam } from '../../../teacher/services/exam.service';
import { Router, RouterLink } from '@angular/router';
import { DatePipe, NgClass, TitleCasePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-list-exams',
  imports: [RouterLink, DatePipe, TitleCasePipe, NgClass],
  templateUrl: './list-exams.html',
  styleUrl: './list-exams.css',
})
export class ListExams implements OnInit {
  router = inject(Router);
  http = inject(HttpClient);

  exams = signal<NewExam[]>([]);

  ngOnInit(): void {
    this.getExams();
  }

  getExams() {
    return this.http
      .get<{ data: NewExam[] }>('http://127.0.0.1:8000/api/student/exams')
      .subscribe({
        next: (res) => {
          this.exams.set(res.data);
          console.log('New Exams:', res.data);
        },
      });
  }

  takeExam(examId: number) {
    this.http
      .post<{ data: NewTakenExam }>(
        `http://127.0.0.1:8000/api/student/exams/${examId}/take`,
        {}
      )
      .subscribe({
        next: (res) => {
          console.log('Taken exam created:', res);
          this.router.navigate(['/student/taken-exams', res.data.id]);
        },
      });
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

export interface NewExam {
  id: number;
  title: string;
  description: string;
  starts_at: Date;
  ends_at: Date;
  year: string;
  sections: string[];
  status: string;
  total_points: number;
  tos: To[];
  created_at: Date;
  updated_at: Date;
  taken_exam?: NewTakenExam;
}

export interface To {
  topic: string;
  outcomes: string[];
  time_allotment: number;
  no_of_items: number;
  distribution: Distribution;
}

export interface Distribution {
  easy: Difficult;
  moderate: Difficult;
  difficult: Difficult;
}

export interface Difficult {
  allocation: number;
  placement: string[];
}

interface NewTakenExam {
  id: number;
  exam_id: number;
  user_id: number;
  started_at: string;
  submitted_at?: string | null;
  total_points?: number;
  updated_at: string;
  created_at: string;
  answers?: ITakenExamAnswer[];
  exam?: Exam;
}
