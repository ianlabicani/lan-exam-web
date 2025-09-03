import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface Taker {
  id: number;
  exam_id: number;
  user_id: number;
  started_at: string;
  submitted_at: string | null;
  total_points: number;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    name: string;
    email: string;
    year: string;
    section: string;
  };
}

@Component({
  selector: 'app-exam-takers',
  imports: [RouterLink, DatePipe, UpperCasePipe],
  templateUrl: './exam-takers.html',
  styleUrl: './exam-takers.css',
})
export class ExamTakers implements OnInit {
  private route = inject(ActivatedRoute);
  loading = signal(true);
  exam = signal<any | null>(null);
  takers = signal<Taker[]>([]);
  http = inject(HttpClient);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading.set(false);
      return;
    }
    this.http
      .get<any>(`http://127.0.0.1:8000/api/teacher/exams/${id}/takers`)
      .subscribe({
        next: (res) => {
          this.exam.set(res);
          this.takers.set(res.taken_exams || []);
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
