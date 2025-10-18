import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { ExamItem } from '../exams/view-exam/view-exam.service';

@Injectable({
  providedIn: 'root',
})
export class ExamItemApiService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/teacher/exams`;

  // ========== EXAM ITEMS ==========
  create(examId: number | string, itemData: any) {
    return this.http.post<{ data: any }>(
      `${this.apiUrl}/${examId}/items`,
      itemData
    );
  }

  updateItem(examId: number | string, itemId: number | string, itemData: any) {
    return this.http.patch<{ data: ExamItem; message: string }>(
      `${this.apiUrl}/${examId}/items/${itemId}`,
      itemData
    );
  }

  deleteItem(examId: number | string, itemId: number | string) {
    return this.http.delete<{ data: ExamItem; message: string }>(
      `${this.apiUrl}/${examId}/items/${itemId}`
    );
  }

  reorderItems(
    examId: number | string,
    items: Array<{ id: number; order: number }>
  ) {
    return this.http.patch<{ data: any }>(
      `${this.apiUrl}/${examId}/items/reorder`,
      { items }
    );
  }

  // ========== GRADING & SUBMISSIONS ==========
  getTakenExams(examId: number | string) {
    return this.http.get<{ data: any }>(`${this.apiUrl}/${examId}/taken-exams`);
  }

  getTakenExam(examId: number | string, takenExamId: number | string) {
    return this.http.get<{ data: any }>(
      `${this.apiUrl}/${examId}/taken-exams/${takenExamId}`
    );
  }

  gradeSubmission(
    examId: number | string,
    takenExamId: number | string,
    gradingData: any
  ) {
    return this.http.post<{ data: any }>(
      `${this.apiUrl}/${examId}/taken-exams/${takenExamId}/grade`,
      gradingData
    );
  }
}
