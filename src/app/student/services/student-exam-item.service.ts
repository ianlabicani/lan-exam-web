import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { IExamItem } from '../exams/taken-exams/create-taken-exam/create-taken-exam';

@Injectable({
  providedIn: 'root',
})
export class StudentExamItemService {
  private http = inject(HttpClient);

  getExamItems(examId: number) {
    return this.http.get<IExamItem[]>(
      `http://127.0.0.1:8000/api/student/exams/${examId}/items`
    );
  }
}
