import { DatePipe, UpperCasePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, input, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-view-exam-takers',
  imports: [UpperCasePipe, DatePipe, RouterLink],
  templateUrl: './view-exam-takers.html',
  styleUrl: './view-exam-takers.css',
})
export class ViewExamTakers implements OnInit {
  examId = input.required<number>();

  loading = signal(true);
  exam = signal<any | null>(null);
  takers = signal<ITakenExam[]>([]);
  http = inject(HttpClient);

  ngOnInit(): void {
    this.http
      .get<{ takenExams: ITakenExam[] }>(
        `http://127.0.0.1:8000/api/teacher/exams/${this.examId()}/takers`
      )
      .subscribe({
        next: (res) => {
          this.exam.set(res);
          this.takers.set(res.takenExams || []);
          console.log(res);

          this.loading.set(false);
        },
        error: () => {
          this.exam.set(null);
          this.takers.set([]);
          this.loading.set(false);
        },
      });
  }
}

interface ITakenExam {
  id: number;
  exam_id: number;
  user_id: number;
  started_at: Date;
  submitted_at: Date;
  total_points: number;
  created_at: Date;
  updated_at: Date;
  user: User;
}

interface User {
  id: number;
  name: string;
  email: string;
  year: string;
  section: string;
  email_verified_at: null;
  created_at: Date;
  updated_at: Date;
}
