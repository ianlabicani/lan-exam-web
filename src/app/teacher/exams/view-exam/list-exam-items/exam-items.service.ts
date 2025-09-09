import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { IExamItem } from './list-exam-items';

@Injectable({
  providedIn: 'root',
})
export class ExamItemsService {
  http = inject(HttpClient);

  create(examId: number, payload: any) {
    return this.http.post<{ item: IExamItem }>(
      `http://127.0.0.1:8000/api/teacher/exams/${examId}/items`,
      payload
    );
  }
}
