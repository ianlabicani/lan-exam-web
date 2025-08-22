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
}
