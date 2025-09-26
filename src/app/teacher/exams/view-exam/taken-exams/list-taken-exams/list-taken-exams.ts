import { UpperCasePipe, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, input, OnInit, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-list-taken-exams',
  imports: [UpperCasePipe, DatePipe, RouterLink],
  templateUrl: './list-taken-exams.html',
  styleUrl: './list-taken-exams.css',
})
export class ListTakenExams implements OnInit {
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
      .get<{ data: ITakenExam[] }>(
        `http://127.0.0.1:8000/api/teacher/exams/${this.examId()}/takenExams`
      )
      .subscribe({
        next: (res) => {
          console.log(res);

          this.exam.set(res);
          this.takers.set(res.data || []);
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
