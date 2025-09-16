import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class ExamService {
  private http = inject(HttpClient);
  viewingExam = signal<Exam | null>(null);
  exams = signal<Exam[]>([]);

  index() {
    return this.http.get<Exam[]>(`${environment.apiBaseUrl}/teacher/exams`);
  }

  show(id: number) {
    return this.http.get<Exam>(`${environment.apiBaseUrl}/teacher/exams/${id}`);
  }

  store(payload: any) {
    return this.http.post<{ exam: Exam }>(
      `${environment.apiBaseUrl}/teacher/exams`,
      payload
    );
  }

  updateStatus(id: number | string, status: string) {
    return this.http.patch<Exam>(
      `${environment.apiBaseUrl}/teacher/exams/${id}/status`,
      { status }
    );
  }
}

export interface Exam {
  id: number;
  title: string;
  description: string;
  starts_at: Date;
  ends_at: Date;
  year: string;
  section: string;
  status: string;
  total_points: number;
  created_at: Date;
  updated_at: Date;
}
