import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Exam } from '../../teacher/services/exam.service';

@Injectable({
  providedIn: 'root',
})
export class StudentExamService {
  http = inject(HttpClient);

  getAll() {
    return this.http.get<{ data: Exam[] }>(
      'http://127.0.0.1:8000/api/student/exams'
    );
  }

  getOne(examId: number) {
    return this.http.get<{ data: Exam }>(
      `http://127.0.0.1:8000/api/student/exams/${examId}`
    );
  }
}

export interface ITakenExam {
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

export interface ITakenExamAnswer {
  id: number;
  taken_exam_id: number;
  exam_item_id: number; // backend field
  type: string;
  answer: any; // stored as string for mcq index coming from backend
  points_awarded?: number | null;
  created_at: string;
  updated_at: string;
}
