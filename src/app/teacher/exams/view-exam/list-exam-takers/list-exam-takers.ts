import { UpperCasePipe, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, input, OnInit, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-list-exam-takers',
  imports: [UpperCasePipe, DatePipe, RouterLink],
  templateUrl: './list-exam-takers.html',
  styleUrl: './list-exam-takers.css',
})
export class ListExamTakers implements OnInit {
  examId = signal<number>(0);
  loading = signal(true);
  exam = signal<any | null>(null);
  takers = signal<ITakenExam[]>([]);
  http = inject(HttpClient);

  activatedRoute = inject(ActivatedRoute);

  ngOnInit(): void {
    this.examId.set(
      +this.activatedRoute.parent?.snapshot.paramMap.get('examId')!
    );
    this.http
      .get<{ takenExams: ITakenExam[] }>(
        `http://127.0.0.1:8000/api/teacher/exams/${this.examId()}/takers`
      )
      .subscribe({
        next: (res) => {
          this.exam.set(res);
          this.takers.set(res.takenExams || []);
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
