import { AuthService } from './../../auth/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

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
  items: Item[];
}

export interface Item {
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

@Injectable({
  providedIn: 'root',
})
export class ExamService {
  http = inject(HttpClient);
  authService = inject(AuthService);

  getAllExams() {
    const token = this.authService.currentUser()?.token.substring(2);

    return this.http.get<{ exams: IExam[] }>(
      'http://127.0.0.1:8000/api/teacher/exams',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }

  createExam(payload: {
    title: string;
    description?: string;
    starts_at?: string | Date | null;
    ends_at?: string | Date | null;
    year: string | number;
    section: string;
    status: string;
    total_points: number;
    items: any[]; // refine later
  }) {
    const token = this.authService.currentUser()?.token.substring(2);
    return this.http.post<{ exam: IExam }>(
      'http://127.0.0.1:8000/api/teacher/exams',
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }

  getExam(id: number) {
    return this.http.get<IExam>(
      `http://127.0.0.1:8000/api/teacher/exams/${id}`,
      { headers: this.authService.authHeader() }
    );
  }

  updateExamStatus(id: number | string, status: string) {
    return this.http.patch<{ exam: IExam }>(
      `http://127.0.0.1:8000/api/teacher/exams/${id}/status`,
      { status },
      { headers: this.authService.authHeader() }
    );
  }

  createItem(examId: number, payload: any) {
    return this.http.post<{ item: Item }>(
      `http://127.0.0.1:8000/api/teacher/exams/${examId}/items`,
      payload,
      { headers: this.authService.authHeader() }
    );
  }

  updateItem(itemId: number | string, payload: any, examId: number) {
    return this.http.patch<{ item: Item }>(
      `http://127.0.0.1:8000/api/teacher/exams/${examId}/items/${itemId}`,
      payload,
      { headers: this.authService.authHeader() }
    );
  }

  deleteItem(itemId: number | string) {
    return this.http.delete<{ success: boolean }>(
      `http://127.0.0.1:8000/api/teacher/exams/items/${itemId}`,
      { headers: this.authService.authHeader() }
    );
  }
}
