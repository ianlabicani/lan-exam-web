import { AuthService } from '../../auth/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class ExamsService {
  http = inject(HttpClient);
  authService = inject(AuthService);

  exams = signal<IExam[]>([]);

  getAll() {
    return this.http
      .get<{ exams: IExam[] }>(`${environment.apiBaseUrl}/teacher/exams`)
      .pipe(
        map((res) => {
          this.exams.set(res.exams);
          return res;
        })
      );
  }

  getOne(id: number) {
    return this.http
      .get<IExam>(`${environment.apiBaseUrl}/teacher/exams/${id}`)
      .pipe();
  }

  createExam(payload: {
    title: string;
    description: string;
    starts_at: string | Date;
    ends_at: string | Date;
    year: string | number;
    section: string;
    status: string;
    total_points: number;
  }) {
    const token = this.authService.currentUser()?.token.substring(2);
    return this.http.post<{ exam: IExam }>(
      'http://127.0.0.1:8000/api/teacher/exams',
      payload
    );
  }

  getExam(id: number) {
    return this.http.get<IExam>(
      `http://127.0.0.1:8000/api/teacher/exams/${id}`
    );
  }

  updateExamStatus(id: number | string, status: string) {
    return this.http.patch<{ exam: IExam }>(
      `http://127.0.0.1:8000/api/teacher/exams/${id}/status`,
      { status }
    );
  }

  createItem(examId: number, payload: any) {
    return this.http.post<{ item: IItem }>(
      `http://127.0.0.1:8000/api/teacher/exams/${examId}/items`,
      payload
    );
  }

  updateItem(examId: number, itemId: number | string, payload: any) {
    return this.http.patch<{ item: IItem }>(
      `http://127.0.0.1:8000/api/teacher/exams/${examId}/items/${itemId}`,
      payload
    );
  }

  deleteItem(itemId: number | string) {
    return this.http.delete<{ success: boolean }>(
      `http://127.0.0.1:8000/api/teacher/exams/items/${itemId}`
    );
  }
}

export interface IExam {
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
  pivot: IExam_Teacher;
  items: IItem[];
}

export interface IItem {
  id: number;
  exam_id: number;
  type: string;
  question: string;
  points: number;
  expected_answer: null | string;
  answer: boolean | null;
  options: Option[] | null;
  created_at: Date;
  updated_at: Date;
}

export interface Option {
  text: string;
  correct: boolean;
}

export interface IExam_Teacher {
  teacher_id: number;
  exam_id: number;
}
