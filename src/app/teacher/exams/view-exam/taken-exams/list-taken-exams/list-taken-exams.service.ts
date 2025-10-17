import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment.development';
import { Observable } from 'rxjs';

export interface StudentAnswer {
  id: number;
  item_id: number;
  taken_exam_id: number;
  answer: string | Record<string, any>;
  is_correct?: boolean;
  score?: number;
  feedback?: string;
  created_at: Date;
  updated_at: Date;
}

export interface TakenExam {
  id: number;
  exam_id: number;
  student_id: number;
  student: {
    id: number;
    name: string;
    email: string;
  };
  started_at: Date;
  submitted_at?: Date;
  score?: number;
  status: 'in_progress' | 'submitted' | 'graded';
  answers: StudentAnswer[];
  answered_count?: number;
  total_questions?: number;
  percentage?: number;
  duration?: number;
  created_at: Date;
  updated_at: Date;
}

@Injectable({
  providedIn: 'root',
})
export class ListTakenExamsService {
  constructor(private http: HttpClient) {}

  /**
   * Get all student submissions for an exam
   */
  getTakenExams(examId: number): Observable<{ data: TakenExam[] }> {
    return this.http.get<{ data: TakenExam[] }>(
      `${environment.apiBaseUrl}/teacher/exams/${examId}/taken-exams`
    );
  }

  /**
   * Get details of a specific student submission
   */
  getTakenExam(
    examId: number,
    takenExamId: number
  ): Observable<{ data: TakenExam }> {
    return this.http.get<{ data: TakenExam }>(
      `${environment.apiBaseUrl}/teacher/exams/${examId}/taken-exams/${takenExamId}`
    );
  }

  /**
   * Submit grades for a student submission
   */
  gradeSubmission(
    examId: number,
    takenExamId: number,
    grades: Record<number, { score: number; feedback?: string }>
  ): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${environment.apiBaseUrl}/teacher/exams/${examId}/taken-exams/${takenExamId}/grade`,
      { grades }
    );
  }
}
