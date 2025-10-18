import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { Exam, TakenExam } from './exam.service';

@Injectable({
  providedIn: 'root',
})
export class ExamItemApiService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/teacher/exams`;

  // ========== EXAM ITEMS ==========
  createItem(examId: number | string, itemData: any) {
    return this.http.post<{ data: Exam; message: string }>(
      `${this.apiUrl}/${examId}/items`,
      itemData
    );
  }

  updateItem(examId: number | string, itemId: number | string, itemData: any) {
    return this.http.patch<{ data: Exam; message: string }>(
      `${this.apiUrl}/${examId}/items/${itemId}`,
      itemData
    );
  }

  deleteItem(examId: number | string, itemId: number | string) {
    return this.http.delete<{ data: Exam; message: string }>(
      `${this.apiUrl}/${examId}/items/${itemId}`
    );
  }

  reorderItems(
    examId: number | string,
    items: Array<{ id: number; order: number }>
  ) {
    return this.http.patch<{ data: Exam; message: string }>(
      `${this.apiUrl}/${examId}/items/reorder`,
      { items }
    );
  }

  // ========== GRADING & SUBMISSIONS ==========
  getTakenExams(examId: number | string) {
    return this.http.get<{ data: TakenExam[]; message: string }>(
      `${this.apiUrl}/${examId}/taken-exams`
    );
  }

  getTakenExam(examId: number | string, takenExamId: number | string) {
    return this.http.get<{ data: TakenExam; message: string }>(
      `${this.apiUrl}/${examId}/taken-exams/${takenExamId}`
    );
  }

  gradeSubmission(
    examId: number | string,
    takenExamId: number | string,
    gradingData: any
  ) {
    return this.http.post<{ data: TakenExam; message: string }>(
      `${this.apiUrl}/${examId}/taken-exams/${takenExamId}/grade`,
      gradingData
    );
  }
}
